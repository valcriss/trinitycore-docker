type GithubRelease = {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
    content_type: string;
  }[];
}