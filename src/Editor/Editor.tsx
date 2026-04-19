import dynamic from "next/dynamic";

const ReactSimpleMdEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import "easymde/dist/easymde.min.css";
import { useState, useRef } from "react";
import { useRouter } from 'next/router';
import { useMemo } from "react";
import "easymde/dist/easymde.min.css";
import { Options } from "easymde";
import Link from "next/link";


//TODO: イベントは発火する[object DataTransferItemList]は持ってこれてる
/**
 * エディタの表示
 * @returns 
 * 
 */
export const MarkdownEditor = () => {
  const [markdownValue, setMarkdownValue] = useState("");
  const simpleMdeRef = useRef<any>(null);
  const router=useRouter();
/**
 * EasyMDEプレビューの追加
 * 型を明示しないとstring[]になってしまう
 * （"bold", "italic", "heading", "|", "preview"しか対応していないため範囲が広すぎる）
 * 別解
 * as const
 * →「この値しか入っていません」と保証できる
 */
const options: Options = useMemo(() => ({
  toolbar: ["bold", "italic", "heading","code","guide","|", "preview"],
  spellChecker: false,
}), []);

  const onChange = (value: string) => {
    setMarkdownValue(value);
  };
  /**
   * イベントの取得　events={{paste:handlePaste}}　e:ClipboardEvent
   * クリップボードからitemの取得　const items = e.clipboardData?.items;　   const file = item.getAsFile();
   * ファイルをアップロード処理（クラスを別で作る）
   * res でパスを取得
   * 表示させる
   * 
   * @returns 
   * e
   */


  const handlePaste=async (data:any,e:ClipboardEvent)=>{
const items = e.clipboardData?.items;

if(!items){
  return 
};

//イベントからitemを取得してuploadに送る
for (const item of items) {
  if (item.type.startsWith("image/")//image/png になる
  ) {
    const file = item.getAsFile(); // ← ここ重要

    if(!file) continue;//これがないとappendできない
   const formData=new FormData();
       const resized=await resizeImage(file);
  

   formData.append("file",resized);


     const res= await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    
    //imageを表示する
    const cm=simpleMdeRef.current;

    if(!cm){
      return;
    }

   //res.url は「APIのレスポンスボディ」ではない、Responseオブジェクト (リクエストしたurl)
   //mdの形式で表示する。
    const data = await res.json();
    cm.replaceSelection(`![](${data.url})`);
  }
}
}




// サイズを小さくする
const resizeImage=(file:File):Promise<Blob>=>{
    return new Promise((resolve)=>{
      const img=new Image();
      const reader=new FileReader();
      reader.onload=(e)=>{
        img.src=e.target?.result as string;
      };
      

      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const ctx=canvas.getContext("2d");
        const MAX_WIDTH=800;
        const scale=MAX_WIDTH/img.width;
        canvas.width=MAX_WIDTH;
        canvas.height=img.height*scale;
        ctx?.drawImage(img,0,0,canvas.width,canvas.height);
        canvas.toBlob((blob)=>{
          if(!blob)return;
          const newFile=new File(
            [blob],
            file.name,
            {type:"image/png"}
          );
          resolve(newFile);
      },"image/png",0.7);
    }
      reader.readAsDataURL(file);
    })
  }
  //作った記事の内容を送る
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;

    const mainImage=formData.get("main-image") as File;
    const tag=formData.get("tag") as string;
  


    const uploadForm=new FormData();
    uploadForm.append("file",mainImage);

//サムネイルは先に送信する
    const res=await fetch("/api/uploadThumbnail",{
      method:"POST",
      body:uploadForm
    });
    const imageData=await res.json();

    const url=imageData.url;
  


    //const imagePath=mainImage.replace(/\.*$/, '');

//　 /apiでなければ送れない
const createPost=async(formData:FormData)=>{
   const res = await fetch("/api/createMd", {
      method: "POST",
      body: JSON.stringify({
        title,
        date,
        content: markdownValue,
        tag,
        mainImage:url
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    //拡張子の削除
    const id=data.pageId.split("/").pop()?.replace(".md","");
    return id;

}
const id=await createPost(formData);

//作成処理
const waitForPostReady = async (id: string) => {
  const timeout = 30000;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`/posts/${id}`);

      if (res.status === 200) {
        return true;
      }
      await new Promise(r=>setTimeout(r,500));
    } catch (e) {
      console.error("fetch error", e);
    }

    
  }

  return false;
};
 const ready= await waitForPostReady(id);
 if(ready){
  alert("作成完了")
  //自動で遷移する
  router.push(`/posts/${id}`)
 }else{
  alert("投稿処理が終わっていない")
 }


   

  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
            タイトル：
        <input type="text" placeholder="タイトル" name="title" style={{width: "90%",height:"80px"}}
          onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }}
        ></input>
        </div>
        <div>
        投稿日：
        <input type="date" name="date"
          onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }}></input>
        </div>
        
        <div>
        サムネイルの画像：
        <input type="file" name="main-image"
          onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }} />
        </div>
        <div>
          <span>タグの追加：</span>
          <select name="tag">
            <option value="1">日常</option>
            <option value="2">技術</option>
          </select>
        </div>
        <ReactSimpleMdEditor
          value={markdownValue}
          onChange={onChange}
          className="md"
          events={{paste:handlePaste}}
          options={options}
          getCodemirrorInstance={(editor)=>{
            simpleMdeRef.current=editor;
          }}
        />
        <button type="submit">送信</button>
        <Link href={"/"}>戻る</Link>
      </form>

    </>
  );
};
