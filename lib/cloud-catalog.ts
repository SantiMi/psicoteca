import {cert,applicationDefault,getApps,initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getItem,library,relatedItems,norm,type LibraryItem} from "@/data/catalog";
import {libraryCategories,type CategoryId} from "@/data/category-config";
export type CatalogRow=Pick<LibraryItem,"id"|"title"|"category"|"family"|"summary">;
export type CatalogPage={items:CatalogRow[];nextCursor:string|null;mode:"local"|"firestore"};
export type LinkedItem=CatalogRow&{kind:string};
const PAGE_SIZE=12;
const categories=new Set<CategoryId>(libraryCategories.map(category=>category.id));
export const validCategory=(value:string|null):CategoryId|undefined=>value&&categories.has(value as CategoryId)?value as CategoryId:undefined;
export const cloudEnabled=()=>process.env.FIREBASE_CONTENT_ENABLED==="true";
function db(){
 const projectId=process.env.FIREBASE_PROJECT_ID;
 if(!projectId)throw new Error("FIREBASE_PROJECT_ID missing");
 const existing=getApps()[0];
 const app=existing??initializeApp({projectId,credential:process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY?cert({projectId,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")}):applicationDefault()});
 return getFirestore(app);
}
const sortKey=(v:CatalogRow)=>norm(v.title)+"#"+v.id;
function sanitize(item:CatalogRow):CatalogRow{return {id:item.id,title:item.title,category:item.category,family:item.family,summary:item.summary};}
export async function searchCatalog(query:string,category?:CategoryId,cursor?:string):Promise<CatalogPage>{
 const q=norm(query).trim().slice(0,48);
 if(!cloudEnabled()){
  const all=library.filter(item=>(!category||item.category===category)&&(!q||norm([item.title,item.family,item.summary,...item.synonyms].join(" ")).includes(q))).sort((a,b)=>sortKey(a).localeCompare(sortKey(b),"es"));
  const after=cursor?all.findIndex(x=>sortKey(x)===cursor)+1:0;
  const page=all.slice(after,after+PAGE_SIZE);
  return {items:page.map(sanitize),nextCursor:after+PAGE_SIZE<all.length&&page.length?sortKey(page[page.length-1]):null,mode:"local"};
 }
 let ref:any=db().collection("catalog").where("visibility","==","published");
 if(category)ref=ref.where("category","==",category);
 if(q)ref=ref.where("prefixes","array-contains",q);
 ref=ref.orderBy("sortKey").limit(PAGE_SIZE+1);
 if(cursor)ref=ref.startAfter(cursor);
 const snap=await ref.get();
 const docs=snap.docs.slice(0,PAGE_SIZE);
 const items=docs.map((doc:any)=>sanitize({...doc.data(),id:doc.id} as CatalogRow));
 return {items,nextCursor:snap.docs.length>PAGE_SIZE&&docs.length?String(docs[docs.length-1].get("sortKey")):null,mode:"firestore"};
}
export async function fetchCatalogItem(id:string):Promise<LibraryItem|null>{
 if(!/^[a-z0-9-]{1,100}$/.test(id))return null;
 if(!cloudEnabled())return getItem(id)??null;
 const database=db();
 const [summary,details]=await Promise.all([database.collection("catalog").doc(id).get(),database.collection("concepts").doc(id).get()]);
 if(!summary.exists||summary.get("visibility")!=="published"||!details.exists)return null;
 const info=summary.data()??{},body=details.data()??{};
 return {id,title:String(info.title??""),category:info.category as CategoryId,family:String(info.family??""),summary:String(info.summary??""),essentials:Array.isArray(body.essentials)?body.essentials:[],deep:String(body.deep??""),references:Array.isArray(body.references)?body.references:[],related:[],status:"borrador",synonyms:[]};
}
export async function fetchLinkedItems(item:LibraryItem):Promise<LinkedItem[]>{
 if(!cloudEnabled())return relatedItems(item).map(x=>({...sanitize(x),kind:"relacionado"}));
 const snap=await db().collection("relations").where("sourceId","==",item.id).limit(30).get();
 return snap.docs.map(d=>d.data()).filter(x=>x.visibility==="published"&&categories.has(x.targetCategory)).slice(0,10).map(x=>({id:x.targetId,title:x.targetTitle,category:x.targetCategory,family:x.targetFamily??"",summary:x.description??"",kind:x.kind??"relacionado"}));
}
