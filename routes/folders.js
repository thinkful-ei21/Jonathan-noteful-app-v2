'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// New DB connection
const knex = require('../knex');

router.get('/folders', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('id', 'name')
    .from('folders')
    .where('folders.id', id)
    .then(([results]) => {
      if (results) {
        res.json(results);
      }else {
        next();
      }
    })
    .catch(err => next(err));

});

router.put('/folders/:id', (req, res, next) => {
  const id = req.params.id;
  
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableField = ['name'];
  
  if (updateableField in req.body) {
    updateObj[updateableField] = req.body[updateableField];
  }
  
  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  knex
    .update(updateObj)
    .from('folders')
    .where('folders.id', id)
    .returning(updateableField)
      
    .then(([results]) => {
      if (results) {
        res.json(results);
      }else{
        next();
      }
    })
    .catch(err => next(err));
}); 

router.post('/folders', (req, res, next) => {
  const { name } = req.body;
  const newFolder = { name };

  if (!newFolder) {
    const err = new Error('Missing `name` in request body.');
    err.status -= 400;
    return next(err);
  }
  knex 
    .insert(newFolder)
    .from('folders')
    .returning(['id', 'name'])
    .then(([results]) =>{
      if (results) {
        res.location(`http://${req.headers.host}/folders/${results.id}`).status(201).json(results);
      } else{
        next();
      }
    })
    .catch(err => next(err));
});

router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .where('folders.id', id)
    .from('folders')
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

module.exports = router;