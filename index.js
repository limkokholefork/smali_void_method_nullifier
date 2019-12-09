"use strict";

const FS                = require("fs")
     ,PATH              = require("path")
     ,RESOLVE           = function(path){ //normalize to Unix-slash (will work on Windows too).
                            path = path.replace(/\"/g,"");
                            path = path.replace(/\\+/g,"/");
                            path = PATH.resolve(path); 
                            path = path.replace(/\\+/g,"/"); 
                            path = path.replace(/\/\/+/g,"/"); 
                            return path;
                          }
     ,ARGS              = process.argv.filter(function(s){return false === /node\.exe/i.test(s) && process.mainModule.filename !== s;})
     ,FILE_IN           = RESOLVE(ARGS[0])
     ;

var   content           = FS.readFileSync(FILE_IN, {flag:"r", encoding:"utf8"})
     ,index_start       = 0
     ,index_end         = 0
     ;
     
//console.log(content);

content = content.replace(/\r+/g, "").replace(/\n/g, "###N###");  //to Unix-EOL, then to one-line (no EOL). 


while(true){
  var tmp
     ,s_locals           = ""
     ,s_method_signature = ""
     ,modified
     ;
  
  index_start = content.indexOf(".method", index_start);
  if(-1 === index_start) break; //end
  index_end   = content.indexOf(".end method", index_start);
  if(-1 === index_end)   break; //end
  
  tmp = content.substring(index_start, index_end + ".end method".length);
  if(-1 !== tmp.indexOf(" abstract ")){index_start = index_end; continue;} //advance, skip. (reason: not modifying abstract methods)
  if(false === /\.method[^\#]+\)V###N###/.test(tmp)){index_start = index_end; continue;} //advance, skip. (reason:not a VOID-METHOD)

  try{
  s_locals = tmp.match(/\.locals\s+(\d+)/)[1];
  }catch(err){}
  if("" === s_locals){index_start = index_end; continue;} //advance, skip. (reason: not valid method, missing .locals)
  
  try{
  s_method_signature = tmp.match(/^(\.method[^\#]+)###N###/)[1];
  }catch(err){}
  if("" === s_method_signature){index_start = index_end; continue;} //advance, skip. (reason: error while extracting)
  
  modified = s_method_signature              + "###N###" 
           + "    " + ".locals " + s_locals  + "###N###" 
           + "    " + "return-void"          + "###N###"
           + ".end method"
           ;

  content = content.substring(0, index_start)
          + modified
          + content.substring(index_end + ".end method".length)

  index_start = index_start + modified.length;  //advance.
}


content = content.replace(/###N###/g, "\r\n");  //back from one-line to multi-line, normalize to Windows EOL.

//console.log("--------------------------------------");

//console.log(content);

FS.writeFileSync(FILE_IN, content, {flag:"w", encoding:"utf8"});    //overwrite
