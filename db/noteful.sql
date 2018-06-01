-- psql -U dev -f ./db/noteful.sql dev-noteful-app

DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100;

CREATE TABLE notes (
    id serial PRIMARY KEY, 
    title text NOT NULL,
    content text,
    created timestamp DEFAULT now(),
    folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

CREATE TABLE tags (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE notes_tags (
    note_id int NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id int NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

INSERT INTO folders (name) VALUES 
    ('Folder 1'),
    ('Folder 2'),
    ('Folder 3');

INSERT INTO notes (title, content, folder_id) VALUES
    ('Note 1', 'Content 1.', 100),
    ('Note 2', 'Content 2.', 101),
    ('Note 3', 'Content 3.', 102),
    ('Note 4', 'Content 4.', NULL),
    ('Note 5', 'Content 5.', 100),
    ('Note 6', 'Content 6.', 101),
    ('Note 7', 'Content 7.', 102),
    ('Note 8', 'Content 8.', NULL);

INSERT INTO tags (name) VALUES
    ('Tag 1'),
    ('Tag 2'),
    ('Tag 3'),
    ('Tag 4');
INSERT INTO notes_tags (note_id, tag_id) VALUES
    (1000, 1), (1000, 2), (1000, 3),
    (1001, 2),
    (1002, 3), (1002, 2), (1002, 1),
    (1003, 4),
    (1004, 1), (1004, 2), (1004, 3),
    (1005, 2),
    (1006, 3), (1006, 2), (1006, 1),
    (1007, 4);

-- SELECT title, tags.name as tag, folders.name as folder FROM notes
-- LEFT JOIN folders ON notes.folder_id = folders.id
-- LEFT JOIN notes_tags ON notes.id = notes_tags.note_id
-- LEFT JOIN tags ON notes_tags.tag_id = tags.id;

-- SELECT * 
-- FROM notes INNER JOIN folders ON notes.folder_id = folders.id;

-- SELECT *
-- FROM notes LEFT JOIN folders ON notes.folder_id = folders.id;

-- SELECT * 
-- FROM notes LEFT JOIN folders ON notes.folder_id = folders.id
-- WHERE notes.id = 1005;