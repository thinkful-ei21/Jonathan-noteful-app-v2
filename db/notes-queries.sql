-- psql -U dev -f ./db/notes-queries.sql dev-noteful-app

-- SELECT * FROM notes;
-- SELECT * FROM notes LIMIT 5;
-- SELECT * FROM notes ORDER BY id ASC;
-- SELECT * FROM notes ORDER BY id DESC;
-- SELECT * FROM notes ORDER BY title ASC;
-- SELECT * FROM notes ORDER BY title DESC;
-- SELECT * FROM notes ORDER BY created ASC;
-- SELECT * FROM notes ORDER BY created DESC;
-- SELECT title FROM notes WHERE title = 'Jonathan';
-- SELECT * FROM notes WHERE title LIKE '%ona%';
-- UPDATE notes SET title='Jon' WHERE title='Jonathan' RETURNING id, title;
-- INSERT INTO notes (title, content) VALUES (null, 'this will fail!');
-- DELETE FROM notes WHERE id='1'; SELECT * FROM notes;


-- SELECT * FROM folders;
-- SELECT * FROM folders LIMIT 5;
-- SELECT * FROM folders ORDER BY id ASC;
-- SELECT * FROM folders ORDER BY id DESC;
-- SELECT * FROM folders ORDER BY title ASC;
-- SELECT * FROM folders ORDER BY title DESC;
-- SELECT * FROM folders ORDER BY created ASC;
-- SELECT * FROM folders ORDER BY created DESC;
-- SELECT title FROM folders WHERE title = 'Jonathan';
-- SELECT * FROM folders WHERE title LIKE '%ona%';
-- UPDATE folders SET title='Jon' WHERE title='Jonathan' RETURNING id, title;
-- INSERT INTO folders (title, content) VALUES (null, 'this will fail!');
-- DELETE FROM folders WHERE id='1'; SELECT * FROM folders;