"use script"

const fs = require("fs");

const array = [];
let outputData = {};
const outputUrl = hexo.public_dir + 'list.json';


const render = (locals) =>
{
    const filter_array = hexo.theme.config.tags_filter;
    const m = new Map();
    if (filter_array !== undefined)
        for (let i = 0; i < filter_array.length; i++)
        {
            m.set(filter_array[i], 0);
        }
    locals.posts.map((post) =>
    {
        let POST = {};
        POST.date = post.date.format('YYYY-MM-DD'); //date
        POST.title = post.title;//title
        POST.url = post.permalink;//url

        //console.log(post.tags.data);
        if (post.excerpt)
        {
            POST.content = change(post.excerpt);
        } else
        {
            let truncateLength = typeof hexo.theme.truncate_length === 'number' ? hexo.theme.truncate_length : 300;
            POST.content = truncateLength === 0 ? null : filterHTMLTag(post.content).substr(0, truncateLength) + '...';
        }//content
        if (!filter_tags(post.tags.data, m))
            array.push(POST);
    });
    outputData.array = array;
    outputData.timestamp = new Date().getTime();
    if (!fsExistsSync(hexo.public_dir))
    {
        fs.mkdir(hexo.public_dir, (err) =>
        {
            if (err)
            {
                console.error(err);
            } else
            {
                console.info('Make dir success!!');
            }
        });
    }

    const text = JSON.stringify(outputData).toString("utf-8");
    fs.writeFile(outputUrl, new Buffer.from(text, "utf-8"), (err) =>
    {
        if (err)
        {
            console.error(err);
        } else
        {
            if (m.size !== 0)
                console.log("过滤tag以及tag对应的文章数");
            for (value of m)
            {
                console.info(value[0] + ":" + value[1]);
            }
            console.info('Generate list success!!');
        }
    });
};

function fsExistsSync(path)
{
    try
    {
        fs.accessSync(path, fs.F_OK);
    } catch (e)
    {
        return false;
    }
    return true;
}

function filter_tags(documents, map) //true即为要过滤
{
    for (let i = 0; i < documents.length; i++)
    {
        if (map.get(documents[i].name) !== undefined)
        {
            let number = map.get(documents[i].name);
            map.set(documents[i].name, number + 1);
            return true;
        }
    }
    return false;
}

function change(content)
{
    const Rex = /<img src="(.*?)">/g;
    const Replace = "<img src=\"" + hexo.config.url + "$1\">";
    return content.replace(Rex, Replace);
}

function filterHTMLTag(msg)
{
    var msg = msg.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
    msg = msg.replace(/[|]*\n/, '') //去除行尾空格
    msg = msg.replace(/&nbsp;/ig, ''); //去掉npsp
    return msg;
}

hexo.extend.generator.register("JSONlist", render);