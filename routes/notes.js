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
    .select('notes.id' , 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.name as tagName', 'tags.id as tagId')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .where('notes.id', id)
    
    .then(results => {
      if(results) {
        const [hydrated] = hydrateNotes(results);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  const tags = req.body.tags;

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
    .then(() => {
      return knex
        .from('notes_tags')
        .where('note_id', id)
        .del();
    })
    .then(() => {
      const tagsInsert = tags.map(tagId => ({ note_id: id, tag_id: tagId }));
      return knex
        .insert(tagsInsert)
        .into('notes_tags');
    })
    .then(()=> {
      return knex
        .select('notes.id', 'title', 'content', 'folders.id as folder_id', 
          'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', id);
    })
    .then((results) => {
      if (results) {
        const [hydrated] = hydrateNotes(results);
        res.json(hydrated);
      }else{
        next();
      }
    })
    .catch(err => next(err));
});  

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id, tags} = req.body;
  const newItem = {title, content, folder_id};
  
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex
        .insert(tagsInsert)
        .into('notes_tags');
    })
    .then(() => {
      return knex
        .select('notes.id', 'title', 'content', 'folders.id as folder_id',
          'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const [hydrated] = hydrateNotes(result);
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
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
