'use strict';

const express = require('express');
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
router.get('/folders', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single item
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

// Put update an item
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
    .returning(['id', 'name'])
      
    .then(([results]) => {
      if (results) {
        res.json(results);
      }else{
        next();
      }
    })
    .catch(err => next(err));
}); 

// Post (insert) an item
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

// Delete an item
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