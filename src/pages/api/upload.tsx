import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import formidable from "formidable";
export const config = {
  api: {
    bodyParser: false,
  },
};
/**
 * req（生データ）
 ↓
formidable.parse()　formidable=ファイル付きフォームを解析するパーサー
デフォルトだとNext.jsはmultipartを解析できないためformidableを使用して解析する。

 ↓
files.file ← ここに入る
 ↓
filepath（tmp保存されてる）
 ↓
fsで読み込んで保存
 * @param req 
 * @param res 
 */
export default function Page(req:NextApiRequest, res:NextApiResponse){
  if (req.method === "POST") {
  
    const form =formidable({multiples: false});//単一ファイルとして受け取る

    /**
     * files: imageファイルが入る
     * files.file._writeStream.path→ファイル名が入る
     */
    form.parse(req,(err,fields,files)=>{
  
        if(err){
            res.status(500).json({error:"解析失敗"});
            return;
        }
        const file=files.file;

     

        const uploadedFile=Array.isArray(file)? file[0]:file;
            if (!uploadedFile) {
      res.status(400).json({ error: "ファイルなし" });
      return;
    }
    const safeName = uploadedFile.originalFilename?.replace(/\s/g, "_");  
        const filePath = path.join('public', 'images',`${safeName}`);
        
        const data=fs.readFileSync(uploadedFile.filepath);//tmpファイルを読み込む
    fs.writeFileSync(filePath,data);
        res.status(200).json({
  url: `/images/${safeName}`
});
res.end();

    })

  }

}

