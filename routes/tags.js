'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// New DB connection
const knex = require('../knex');

// Get All (and search by query)
router.get('/tags', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single item
router.get('/tags/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex
    .select('id', 'name')
    .from('tags')
    .where('tags.id', id)
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
router.put('/tags/:id', (req, res, next) => {
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
    .from('tags')
    .where('tags.id', id)
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
router.post('/tags', (req, res, next) => {
  const { name } = req.body;
  
  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newItem = { name };
  
  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(([results]) => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/tags/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex
    .where('tags.id', id)
    .from('tags')
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});


module.exports = router;