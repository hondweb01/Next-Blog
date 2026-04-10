import fs from "fs";
import { NextPage } from "next";
import Link from "next/link";
import path from "path";
import matter from "gray-matter";
import Image from "next/image";
import { styleText } from "util";

/**
 * コンポーネントの受け取る方を宣言
 */
type Post = {
category: string;
  title: string;
  date: string;
  convertImage: string;
  id:string;
};

type Props = {
  posts: Post[];
};
/**
 * 記事の取得
 * @returns  記事一覧をpropsとして渡す
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStaticProps() {

  const newsFiles = fs.readdirSync(
    path.join(process.cwd(), "src", "articles")

  );
      const posts=newsFiles.map((file)=>{
        //パスの指定、mdファイルを読み取る
       const filePath=path.join(process.cwd(),"src","articles",file);
       //ファイルの中身を取得
       const fileContent=fs.readFileSync(filePath,"utf-8");
       //メタデータ？
       const{data}=matter(fileContent);
  return {

        id:file.replace(/\.md/,""),
        date: data.date,
      convertImage: data.convertImage,
      title:data.title

  };


        
    });
return {
  props: {
    posts,
  },
};


}
/**
 * Props型を受け取り画面表示させる
 * 
 * @returns 
 */
const Index: NextPage<Props> = ({ posts }) => {
  return (
   <div>
      {/* 検索バー */}
      <input
   
        type="text"
        placeholder="検索..."
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />

      {/* カード一覧 */}
      <div     style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {posts.map((post) => (
          //div（親）だけでリストを管理しているため、親要素にkeyを入れる（keyは map直下だけ必要）
          <div  key={post.id} style={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <a  href={`/posts/${post.id}`}>
              
              {/* 画像 */}
              <img 
                src={post.convertImage}
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />

              {/* テキスト */}
              <div style={{ padding: "10px" }}>
                <p style={{ fontSize: "12px", color: "gray" }} >
                  投稿日：{post.date}
                </p>
                <h3 style={{ textDecoration: "none" }} >{post.title}</h3>
              </div>

            </a>
          </div>
        ))}
      </div>
    </div>
  );
};


  export default Index;
