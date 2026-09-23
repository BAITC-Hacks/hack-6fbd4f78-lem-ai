const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const html=read('index.html').replace('<link rel="stylesheet" href="styles.css" />',()=>'<style>'+read('styles.css')+'</style>').replace('<script src="app.js"></script>',()=>'<script>'+read('app.js').replace(/<\/script/gi,'<\\/script')+'</script>');
if(html.includes('src="app.js"'))throw Error('Script was not bundled');
fs.writeFileSync(path.join(__dirname,'demo.html'),html);
console.log('Built demo.html');
