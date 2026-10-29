export type InventorySource = {
 id:string;system:"DSM-5-TR"|"ICD-11";version:string;language:string;scope:string;
 sourceUrl?:string;localFilename?:string;sourceSha256:string;pdfPageCount?:number;attribution?:string;
 extractionStatus:"partial"|"complete";coverageCheck?:{expectedEntries:number;unresolvedItems:number;method:string};notes:string[];
};
export type InventoryEntry = {
 id:string;sourceId:string;sourceEntryId:string;title:string;
 kind:"group"|"diagnosis"|"subtype"|"specifier"|"clinical-condition"|"research-condition"|"coded-category"|"unclassified";
 parentId:string|null;code:string|null;codeSystem:string|null;pdfPage:number|null;printedPage:string|null;
 destinationPrintedPage?:number|string|null;uri:string|null;sortOrder:number;scope:"core"|"related";
 reviewStatus:"pending"|"verified";contentStatus:"missing"|"draft"|"reviewed"|"published";topicId:string|null;notes:string[];
};
/** Classification extraction is independent of clinical review and publication. */
export type InventoryDocument = {schemaVersion:1;sources:InventorySource[];entries:InventoryEntry[];runs?:unknown[]};
export type ClassificationInventory = InventoryDocument;
