import {NextRequest,NextResponse} from "next/server";
import {searchCatalog,validCategory} from "@/lib/cloud-catalog";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const url=request.nextUrl.searchParams;
 const query=(url.get("q")??"").slice(0,64);
 const cat=url.get("category");
 const category=validCategory(cat);
 if(cat&&!category)return NextResponse.json({error:"Categoría inválida"},{status:400});
 const cursor=(url.get("cursor")??"").slice(0,160);
 try{
  const result=await searchCatalog(query,category,cursor||undefined);
  return NextResponse.json(result,{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
 }catch(e){console.error("Catalog query failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"No fue posible consultar la biblioteca."},{status:503});}
}
