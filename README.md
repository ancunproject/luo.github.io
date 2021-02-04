# luo.github.io

## 安装hexo
在node.js的环境下安装，但是node.js版本不能过低，最好在V11以上
运行命令行：
```
cd ~/hexo
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo g # 或者hexo generate
hexo s # 或者hexo server，可以在http://localhost:4000/ 查看
```

## 创建新的页面

```
hexo new [layout] <title>
```

新建一篇文章。如果没有设置 `layout` 的话，默认使用 [_config.yml](https://hexo.bootcss.com/docs/configuration.html) 中的 `default_layout` 参数代替。如果标题包含空格的话，请使用引号括起来。

```
$ hexo new "post title with whitespace"
```

| 参数              | 描述                                          |
| :---------------- | :-------------------------------------------- |
| `-p`, `--path`    | 自定义新文章的路径                            |
| `-r`, `--replace` | 如果存在同名文章，将其替换                    |
| `-s`, `--slug`    | 文章的 Slug，作为新文章的文件名和发布后的 URL |

默认情况下，Hexo 会使用文章的标题来决定文章文件的路径。对于独立页面来说，Hexo 会创建一个以标题为名字的目录，并在目录中放置一个 `index.md` 文件。你可以使用 `--path` 参数来覆盖上述行为、自行决定文件的目录：

```
hexo new page --path about/me "About me"
```

以上命令会创建一个 `source/about/me.md` 文件，同时 Front Matter 中的 title 为 `"About me"`

注意！title 是必须指定的！如果你这么做并不能达到你的目的：

```
hexo new page --path about/me
```

此时 Hexo 会创建 `source/_posts/about/me.md`，同时 `me.md` 的 Front Matter 中的 title 为 `"page"`。这是因为在上述命令中，hexo-cli 将 `page` 视为指定文章的标题、并采用默认的 `layout`。

## 创建github pages页面
hexo文件不能直接放在github上面使用，创建github pages页面的话有两种方法：
1.hexo g生成静态文件并提交到github,第一次会生成public文件夹
2.可以使用hexo deployment部署到很多平台, 如果需要部署到github，需要_config.yml中做如下修改：
```
deploy:
  type: git
  repo: git@github.com:username/username.github.io.git
  branch: master
```
然后执行以下代码完成部署：
```
hexo d
```
## 常见命令
```
hexo new "postName" #新建文章
hexo new page "pageName" #新建页面

hexo generate (hexo g) 生成静态文件，会在当前目录下生成一个新的叫做public的文件夹
hexo server (hexo s) 启动本地web服务，用于博客的预览
hexo deploy (hexo d) 部署播客到远端（比如github, heroku等平台）

hexo d -g #生成部署
hexo s -g #生成预览
```
