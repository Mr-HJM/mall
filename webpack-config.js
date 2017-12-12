/**
 * Created by YU on 2015/9/17.
 */
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
/**
 *
 * @param isDev 是否是开发者模式 true 开gulpFile.jsgulpFile.js启
 * @param isOpenDevTool 是否开启调试工具 true 开启
 * @param isRev 是否做版本化控制 true 开启
 * @returns {{watch: *, devtool: *, output: {path, publicPath, filename, chunkFilename}, cache: *, module: {loaders: *[]}, resolve: {root: *[], extensions: string[], modulesDirectories: string[], alias: {mock: string}}, plugins, externals: {zepto: string}}}
 */
module.exports = function(isDev,isOpenDevTool,isRev){


    return  {
        watch: isDev,
        devtool:isOpenDevTool ? "#inline-source-map" : null,
        output:(function(){

            if(!isRev){
                return {
                    path:path.join(__dirname ,'bundle','js'),
                    publicPath:'/bundle/js/',//配置chunkFile加载地址的,这里要写服务器路径,可以写cdn的地址
                    filename:'[name].js',
                    chunkFilename:'[name].chunk.js'
                };
            }else{
                return {
                    path:path.join(__dirname ,'bundle','js'),
                    publicPath:'/bundle/js/',//配置chunkFile加载地址的,这里要写服务器路径,可以写cdn的地址
                    filename:'[name]-[chunkhash].min.js',
                    chunkFilename:'[name]-[chunkhash].chunk.min.js'
                };
            }

        })(),
        cache:isDev,
        module:{
            loaders:[
                {test:/\.less$/,loader:"style!css!less"},//less加载
                {test:/\.json$/,loader:'hson'},//加载json对象
                {test:/\.tpl$/,loader:'tmodjs-loader'},//tpl解释对象
                {test:/\.(png|jpeg|jpg|gif)$/,loader:'url?limit=8192'},//图片加载对象
                {test:/^es5-sham\.min\.js|es5-shim\.min\.js$/,loader:'script'}
            ]
        },
        resolve:{
            root:[path.join(__dirname,'js')],
            extensions:['.js','.less','','.tpl','.json'],
            modulesDirectories:['node_modules','tpl','config','dep'],
            alias:{
                'web-uploader':'web-uploader/webuploader.min.js',
                'store':'store.min.js'
            }
        },
        plugins:(function(){
            var plugins;
            if(!isRev){
                plugins = [
                    new webpack.optimize.CommonsChunkPlugin({
                        name:'vendor',
                        filename:'vendor.js',
                        minChunks:/*4*/Infinity//Infinity 代表不进行合并，主要是开发的时候能用上，线上版本的时候 最好写成一个数字比如3，当出现3次的时候将打包进入vendor中
                    })
                ];
            }else{
                plugins = [
                    new webpack.optimize.CommonsChunkPlugin({
                        name:'vendor',
                        filename:isRev ? '[name]-[chunkhash].min.js' : '[name].js',
                        minChunks:10//Infinity 代表不进行合并，主要是开发的时候能用上，线上版本的时候 最好写成一个数字比如3，当出现3次的时候将打包进入vendor中
                    }),
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        }
                    }),
                    function() {
                        this.plugin("done", function(stats) {
                            var chunkNameInfo = stats.toJson().assetsByChunkName;
                            var results = {};
                            //KEY值加上.js
                            for(var key in chunkNameInfo){
                                results[key + '.js'] = chunkNameInfo[key];
                            }
                            fs.writeFileSync(path.join(__dirname, "dist", "stats.json"),JSON.stringify(results));
                        });
                    }
                ];
            }
            return plugins;
        })(),
        externals:{
            'jquery':'$',
            'UM':'UM'
        }
    };
};