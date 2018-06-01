'use strict';

const express = require('express');
const router = express.Router();

const knex = require('../knex');
const hydrateNotes = require('../utils/hydrateNotes');

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm, folderId } = req.query;

  knex
    .select('notes.id' , 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.name as tagName', 'tags.id as tagId')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')

    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })

    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })

    .orderBy('notes.id')
    .then(results => {
      // console.log(results);
      if(results) {
        const hydrated = hydrateNotes(results);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', id)
    
    .then(([results]) => {
      if (results) {
        res.json(results);
      }else{
        next();
      }
    })
    .catch(err => next(err));

});


// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  knex
    .update(updateObj)
    .from('notes')
    .where('notes.id', id)
    .returning('id')
    .then(([id])=> {
      return knex
        .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id);
    })
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
router.post('/notes', (req, res, next) => {
  const { title, content, folderId } = req.body;
  const newItem = {title: title, content: content, folder_id: folderId};

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert({title: title, content: content, folder_id: folderId})
    .into('notes')
    .returning('id')
    .then(([id]) => {
      return knex
        .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id);
    })
    .then(([results]) => {
      if (results) {
        res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
      }else{
        next();
      }
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .where('notes.id', id)
    .from('notes')
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});  

module.exports = router;
