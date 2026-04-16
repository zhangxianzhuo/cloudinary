  require('dotenv').config()
  const cloudinary = require('cloudinary').v2
  const http = require('http')
  const fs = require('fs')
  const port = process.env.PORT || 3000

  cloudinary.config({
  	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  	api_key: process.env.CLOUDINARY_API_KEY,
  	api_secret: process.env.CLOUDINARY_API_SECRET
  })

  const server = http.createServer(async (req, res) => {
    const {url, method} = req

    if(method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    if(url === '/favicon.ico') {
      res.writeHead(204)
      res.end()
      return
    }

    if( method === 'GET') {
      if(url === '/') {
        const reader = fs.createReadStream('cloudinary.html')
        reader.pipe(res)
      } 

      if(url === '/upload') {
        let content = fs.readFileSync('upload.html', 'utf8')
        const addresses = await fetchResource()
        let part = ""

        addresses.forEach((v, k) => {
          part += `<li><a href="${v}" target="_blank">${k}</a></li>`
        })

        console.log(part)
        content = content.replace("worship_list_here", part)
        res.writeHead(200, {"Content-Type": "text/html"})
        res.end(content)
      }
      return
    }

    res.writeHead(404, "good", {"Content-Type": "text/plain; charset=utf-8"})
    res.end("没有匹配到任何请求！")  
  })

  server.listen(port, () => {
    console.log(`server is running at http://172.18.40.46:${port}`)
  })








  // 获取资源列表使用 search API
  async function fetchResource() {
    try {
      const map = new Map()
      const result = await cloudinary.search
      .expression('folder:worship')
      .sort_by('public_id')
      .max_results(10)
      .execute()

      result.resources.forEach(e => {
        map.set(e.display_name, e.secure_url)
      })

      // console.log(map)
      // map.forEach((v,k) => {
      //   console.log("key: ", k, "\nvalue: ", v)
      // })
      return map
    } catch (err) {
      console.error("error:", err.message)
    }
  }
