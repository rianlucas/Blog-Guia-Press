const express = require('express')
const Category = require('./Category')
const router = express.Router()
const slugify = require('slugify')

router.get('/admin/categories/new', (req, res)=> {
    res.render('./admin/categories/new')
})

router.post('/categories/save', (req, res)=> {
    let tittle = req.body.tittle
    if (tittle != undefined) {

        Category.create({
            tittle,
            slug: slugify(tittle)
        }).then(()=> {
            res.redirect('/admin/categories')
        })

    } else {
        res.redirect('/admin/categories/new')
    }
})

router.get('/admin/categories', (req, res)=> {

    Category.findAll().then((categories) => {
        res.render('admin/categories/index', {
            categories,
        })
    })
})

router.post('/categories/delete', (req, res)=> {
    let id = req.body.id
    if (id != undefined) {

        if(!isNaN(id)) {
            Category.destroy({
                where: {
                    id: id
                }
                }).then(()=> {
                    res.redirect('/admin/categories')
            })
        } else {
            res.redirect('/admin/categories')
        }

    } else {
        res.redirect('/admin/categories')
    }
})

router.get('/admin/categories/edit/:id', (req, res)=> {
    let id = req.params.id

    if (isNaN(id)) {
        res.redirect('/admin/categories')
    }

    Category.findByPk(id)
    .then((category) => {
        if (category != undefined) {
            res.render('admin/categories/edit', {category: category })
        } else {
            res.redirect('/admin/categories')
        }
    }).catch((error)=> {
        res.redirect('/admin/categories')
    })
})

router.post('/categories/update', (req, res)=> {
    let id = req.body.id
    let tittle = req.body.tittle
    
    //? Primeiro você passa qual campo do b.d você quer editar
    //* Mudar titulo onde o id for igual ao id
    Category.update({tittle, slug: slugify(tittle)}, {
        where: {
            id,
        }
    }).then(()=> {
        res.redirect('/admin/categories')
    })
})

module.exports = router