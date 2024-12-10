
# SysDocBatch Model

The SysDocBatch Model pattern is for handling documents in batches.  
We suggest you keep the SysDocBatch and SysDoc Classes transient.  

### Features
- Creating documents (.ods, .odt, .docx, xlsx .pdf).
- Converting documents formats.
- Zip documents.
- Download documents.

### Requirements
- LibreOffice Application. [Check here](https://wiki.mdriven.net/Documentation:Use_LibreOffice_for_PDF_conversion) for details on using Libre office.

## Usage
- Merge the pattern into your model from TK Live View.
- Set the **SysMDrivenMiscSettingsSingleton.oclSingleton.LibreOfficeInstallPathandExe** attribute value to Libre office path after installation.
- Create a Template ViewModel that will be used to generate text documents.
- Create a Class Action on the ViewModel that will be used to generate the text documents.  

Execute Expression to create the text document and navigate to SysDocBatchView for pdf conversion.  

```
let doc=SysDoc.Create in
(
  doc.DocData:=self.opendocumentreportasblob(Order.ViewModels.OrderReceiptViewModel);
  doc.DocName:='order-receipt.odt';
  doc.DocDirectory:='order-docs';
  
  let sysDocBatch=SysDocBatch.Create in
  (
     sysDocBatch.SysDocs.add(doc);
     SysSingleton.oclSingleton.currentSysDocBatch:=sysDocBatch 
  ) 
)
```

To zip many documents together, attach all the SysDoc(s) to a single SysDocBatch.  

```
let doc=SysDoc.Create in
(
doc.DocData:=self.opendocumentreportasblob(Order.ViewModels.OrderReceiptViewModel);
doc.DocName:='order-receipt.odt';
doc.DocDirectory:='order-docs';

  let sys=SysSingleton.oclSingleton in 
  (
    (sys.CurrentSysDocBatch.isNull).whentrue(sys.CurrentSysDocBatch:=SysDocBatch.Create);
    sys.CurrentSysDocBatch.SysDocs.add(doc)
  )
)
```  

SysDocBatch will only be created the first time and used for subsequent executions.  

[Check Here](https://wiki.mdriven.net/Documentation:SysDocBatch) for more details on the SysDocBatch pattern.