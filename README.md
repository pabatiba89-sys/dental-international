# Dental International — 牙科国际网站复刻预览

按 huangshandental.com 的公开站点结构、页面布局、深蓝与橙色视觉系统、响应式导航和交互形式制作。本站使用独立品牌占位、原创编辑文案与全新 AI 场景图。

## 页面范围

共 77 个可直接访问的 HTML 页面，另有 404 页面。覆盖 2026-11-10 原站 sitemap 中的全部 76 个路径，并补上导航中的 About Us。包含首页、种植牙总览、单颗／多颗种植、All-on-4、All-on-6、瓷贴面、糖尿病相关评估、麻醉诊疗、价格、关于、案例展示、FAQ、联系、隐私、7 个 service 路径、博客列表和 55 个文章详情页。

`seo-inventory.json` 列出全部页面与关键词；`dist/seo-keywords.csv` 可直接导入表格查看。保留发现时的文章 URL，文章正文为重新编写的咨询准备内容，并非原站文章的全文复制。

## 实现与编辑

- `src/pages/`：可编辑的每页 HTML，含逐页 title、description、keywords、canonical、Open Graph、Twitter Card 与 JSON-LD。
- `dist/assets/app.js`：移动导航、轮播、对比滑块、图片放大、动态展示、文章分类／搜索／分页、咨询申请准备、界面语言选择。
- `dist/assets/app.css`：共享交互与响应式补充样式。
- `dist/assets/site.css`：与参考页面对应的布局样式；已移除原站字体依赖。
- `dist/assets/`：8 张 AI 场景图片和原创 SVG 品牌／种植示意图，均从本站加载。
- `site.config.json`：品牌、网站 origin 与待配置的联系字段。

无需 JavaScript 构建工具。运行 `python build.py` 从 `src/pages/` 生成 `dist/` 并更新 sitemap、robots 和配置文件。将整个 `dist/` 部署到支持目录式 HTML 路径的静态主机。直接双击 HTML 文件不适用于以 `/` 开头的路由和资源地址。

修改域名或工作品牌时，在 `site.config.json` 更新 `origin`、`brand` 后重新构建。电话、邮箱、地址与实际咨询接收接口尚未接入，修改配置字段本身不会自动建立业务系统；需同时更新页面联系信息和表单发送逻辑。

## 部署到 Cloudflare Pages

在 Cloudflare 控制台的 Workers & Pages 中创建 Pages 项目，连接 GitHub 仓库 `pabatiba89-sys/dental-international`。

| 设置 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `python3 build.py` |
| Build output directory | `dist` |
| Root directory | 仓库根目录 |

Pages 构建时会用项目域名生成 canonical、分享链接、sitemap 和 robots.txt。绑定自定义域名后，在 Pages 的构建环境变量中设置 `SITE_ORIGIN=https://你的域名` 并重新部署。原有 ChatGPT 私有预览仍有独立的访问入口。

## 动态交互

- 轮播支持按钮、键盘和触摸横向滚动；尊重减少动态效果设置。
- 对比滑块支持触摸／指针、左右键、Home 与 End。
- 原第三方患者视频替换为明确标注 AI 的动态场景展示，含上一幕、下一幕与播放暂停。
- 博客含 6 类主题、搜索、空结果状态、每页 12 条分页和可分享的分类参数。
- FAQ 使用原生 details／summary，关闭脚本时仍可用。
- 咨询表单有必填、电话与邮箱校验，生成可下载的本地咨询申请；不发送到原医院，不上传个人健康资料，也不伪造发送成功。
- 英／中／日／德／法导航与表单界面可切换；正文目前为英文。界面会明确提示其他语言正文尚未完成翻译。

## SEO 与正式使用边界

已提供逐页基础元数据、WebSite／WebPage／BreadcrumbList、文章 Article、FAQPage、sitemap.xml、robots.txt、社交分享信息与本地图片。并未虚构医院地址、资质、评分、真实病例或医生作者结构化数据。

ChatGPT 预览需要登录访问。Cloudflare Pages 部署会生成自己的访问地址，可用该地址核对页面和 sitemap。

上线前需用经营主体的真实资料替换品牌、联系电话、邮箱、地址、价格与服务安排，接入实际咨询接收渠道，并完成患者内容与译稿的专业审核。AI 图片均为概念演示，不代表真实场所、员工、患者或疗效；互动对比使用规划与咨询场景，不是治疗前后照片。

## 验证

`qa-results.json` 记录验证范围。已在浏览器逐页访问 77 个页面，修正一篇文章的空标题；检查 77 个非重复标题、所有本地图片和站内链接、结构化数据 JSON，以及主要交互。首页截图位于 `docs/home-preview.png`。

视觉与内容属于可验收预览：图片、品牌、文章正文、视频与病例内容已替换，因此不宣称已经完成文字、临床素材与所有语言均相同的逐像素 1:1 成品。
