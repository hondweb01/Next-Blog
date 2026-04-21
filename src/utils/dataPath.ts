import path from 'path';
import fs from 'fs';

// Node.js プロセス内の環境変数から Electron の userData パスを取得
// もし設定されていなければ、現在のディレクトリ（開発環境）をフォールバックとして使用
export function getBaseDataPath() {
  return process.env.USER_DATA_PATH || process.cwd();
}

// 記事保存用ディレクトリを取得し、存在しなければ作成する
export function getArticlesPath() {
  const base = getBaseDataPath();
  const articlesPath = process.env.USER_DATA_PATH 
    ? path.join(base, 'articles') 
    : path.join(base, 'src', 'articles'); // 開発環境での互換性を保つ
    
  if (!fs.existsSync(articlesPath)) {
    fs.mkdirSync(articlesPath, { recursive: true });
  }
  return articlesPath;
}

// 画像保存用ディレクトリ（通常画像）を取得し、存在しなければ作成する
export function getImagesPath() {
  const base = getBaseDataPath();
  const imagesPath = process.env.USER_DATA_PATH 
    ? path.join(base, 'images') 
    : path.join(base, 'public', 'images'); // 開発環境での互換性を保つ

  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }
  return imagesPath;
}

// サムネイル保存用ディレクトリを取得し、存在しなければ作成する
export function getThumbnailsPath() {
  const base = getBaseDataPath();
  const thumbnailsPath = process.env.USER_DATA_PATH 
    ? path.join(base, 'images', 'thumbnail') 
    : path.join(base, 'public', 'images', 'thumbnail'); // 開発環境での互換性を保つ

  if (!fs.existsSync(thumbnailsPath)) {
    fs.mkdirSync(thumbnailsPath, { recursive: true });
  }
  return thumbnailsPath;
}
