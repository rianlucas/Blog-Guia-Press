const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const slugify = require('slugify')
const adminAuth = require('../middlewares/adminAuth')

router.get('/admin/articles', adminAuth, (req, res)=> {
    Article.findAll({
        //* incluir os dados do model Category nos articles
        //* Só é possível por conta da relação entre os B.D
        include: [{model: Category}]
    }).then((articles)=> {
        res.render('admin/articles/index', {articles})
    })
})

router.get('/admin/articles/new', adminAuth,(req, res)=> {
    Category.findAll().then((categories)=> {
        res.render('admin/articles/new', {
            categories
        })
    })
})

router.post('/articles/save', (req, res)=> {
    let tittle = req.body.tittle
    let body = req.body.body
    let category = req.body.category

    Article.create({
        tittle,
        slug: slugify(tittle),
        body,
        categoryId: category
    }).then(()=> {
        res.redirect('/admin/articles')
    })
})

router.post('/articles/delete', (req, res)=> {
    let id = req.body.id
    if (id != undefined) {

        if(!isNaN(id)) {
            Article.destroy({
                where: {
                    id: id
                }
                }).then(()=> {
                    res.redirect('/admin/articles')
            })
        } else {
            res.redirect('/admin/articles')
        }

    } else {
        res.redirect('/admin/articles')
    }
})

router.get('/admin/articles/edit/:id', (req, res) => {
    let id = req.params.id
    Article.findByPk(id).then(article=> {
        if (article != undefined) {           
            Category.findAll().then(categories=> {
                res.render('admin/articles/edit', {
                    categories,
                    article
                })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
    })
})

router.post('/article/update', (req, res) => {
    let id = req.body.id
    let tittle = req.body.tittle
    let body = req.body.body
    let categoryId = req.body.category

    Article.update({tittle, body, categoryId, slug: slugify(tittle)}, {
        where: {
            id,
        }
    }).then(()=> {
        res.redirect('/admin/articles')
    }).catch(error => {
        res.redirect('/')
    })

})

router.get('/articles/page/:num', (req, res)=> {
    let page = req.params.num
    let offset = 0
    
    if(isNaN(page) || page == 1) {
        offset = 0
    } else {
        offset = (parseInt(page) - 1 ) * 4
    }

    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order:[
            ['id', 'desc']
        ]
    }).then(articles => {
        
        let next;
        if (offset + 4 >= articles.count) {
            next = false
        } else {
            next = true
        }

        let result = {
            page: parseInt(page),
            next: next,
            articles: articles,
        }
        Category.findAll().then(categories => {
            res.render('admin/articles/page', {
                result: result,
                categories,
            })
        })
    }) 
})


module.exports = router