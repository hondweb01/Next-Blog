import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
export default function Page(req:NextApiRequest, res:NextApiResponse){
  if (req.method === "POST") {
    const { content,title,date,tag,mainImage } = req.body; // ← ここで受信
    const nowDate=Date.now();
    const mdTemplate=
`---
title: '${title}'
date: '${date}'
categories: '${tag}'
convertImage: '${mainImage}'
---
${content}
    `
    //現在のパスを取得
    const filePath = path.join('src', 'articles',`${nowDate}.md`);
    const mdPath = path.join(`${nowDate}.md`);
    
//const filePath=path.join(process.cwd(),"posts",`${nowDate}.md`);
fs.writeFileSync(filePath,mdTemplate);
    res.status(200).json({ message: "成功",pageId:mdPath });
  }

}
