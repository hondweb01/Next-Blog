import dynamic from "next/dynamic";

const ReactSimpleMdEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import "easymde/dist/easymde.min.css";
import { useState, useRef } from "react";

//TODO: イベントは発火する[object DataTransferItemList]は持ってこれてる
/**
 * エディタの表示
 * @returns 
 * 
 */
export const MarkdownEditor = () => {
  const [markdownValue, setMarkdownValue] = useState("");
  const simpleMdeRef = useRef<any>(null);

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


//イベントからitemを取得してuploadに送る
for (const item of items) {
  if (item.type.startsWith("image/")//image/png になる
  ) {
    const file = item.getAsFile(); // ← ここ重要
    console.log(file)
    if(!file) continue;//これがないとappendできない
   const formData=new FormData();
       const resized=await resizeImage(file);
          console.log("↓画像")

   formData.append("file",resized);

   console.log(formData.get("file"));
     const res= await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    
    //imageを表示する
    const cm=simpleMdeRef.current;
    console.log(cm)
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

    const mainImage=(formData.get("main-image") as File).name;
    const tag=formData.get("tag") as string;
    console.log(mainImage);
    //const imagePath=mainImage.replace(/\.*$/, '');

//　 /apiでなければ送れない
    const res = await fetch("/api/createMd", {
      method: "POST",
      body: JSON.stringify({
        title,
        date,
        content: markdownValue,
        tag,
        mainImage
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
            タイトル：
        <input type="text" placeholder="タイトル" name="title" style={{width: "90%",height:"80px"}}></input>
        </div>
        <div>
        投稿日：
        <input type="date" name="date"></input>
        </div>
        
        <div>
        サムネイルの画像：
        <input type="file" name="main-image" />
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
          getCodemirrorInstance={(editor)=>{
            simpleMdeRef.current=editor;
          }}
        />
        <button type="submit">送信</button>
      </form>
    </>
  );
};
