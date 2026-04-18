/**
 * サムネイルの受け取り
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
import formidable from "formidable";
import { readFileSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from 'fs';

export default function Thumbnail(req:NextApiRequest, res:NextApiResponse){
    if(req.method==='POST'){
        const form =formidable({multiples: false});//単一ファイルとして受け取る
        form.parse(req,(err,fields,files)=>{
            if(err){
                res.json({error:"解析失敗"})
            }
            //この時点でtmpが作成される
            const file=files.file;
            const uploadFile=Array.isArray(file)? file[0]:file;
            const name=uploadFile?.originalFilename?.replace(/\s/g, "_");
            const imagePath= path.join('public',"images","thumbnail",`${name}`);
            
            const data=fs.readFileSync(uploadFile.filepath);
            fs.writeFileSync(imagePath,data);
            res.status(200).json({
                url:`/images/thumbnail/${name}`
            })
            console.log(data);
            res.end();
          
        
        })

    }
  
}
