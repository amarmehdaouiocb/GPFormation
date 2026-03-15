import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// The 'contenus' directory is copied to 'site/src/content' during build, or we can just read from it directly
// since we copied it to site/src/content
const contentDirectory = path.join(process.cwd(), 'src/content');

export function getMarkdownContent(filename: string) {
  try {
    const fullPath = path.join(contentDirectory, `${filename}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Use gray-matter to parse the metadata section
    const { data, content } = matter(fileContents);

    return {
      data,
      content,
    };
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error);
    return { data: {}, content: '' };
  }
}

export function getAllMarkdownSlugs(prefix: string = '') {
  try {
    const fileNames = fs.readdirSync(contentDirectory);
    return fileNames
      .filter(fileName => fileName.startsWith(prefix) && fileName.endsWith('.md'))
      .map(fileName => fileName.replace(/\.md$/, ''));
  } catch (error) {
    console.error(`Error reading markdown directory:`, error);
    return [];
  }
}
