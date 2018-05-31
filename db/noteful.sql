-- psql -U dev -f ./db/noteful-app.1.sql dev-noteful-app

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100;

INSERT INTO folders (name) VALUES 
    ('Archives'),
    ('Drafts'),
    ('Personal'),
    ('Work');

CREATE TABLE notes (
    id serial PRIMARY KEY, 
    title text NOT NULL,
    content text,
    created timestamp DEFAULT now(),
    folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

INSERT INTO notes (title, content, folder_id) VALUES
    (
        '5 life lessons learned from cats',
        'Lorem laborum.',
        100
    ),
    (
        'What the government doesn''t want you to know about cats',
        'Posuere nisl.',
        101
    ),
    (
        'The most boring article about cats you''ll ever read',
        'Lorem laborum.',
        102
    ),
    (
        '7 things lady gaga has in common with cats',
        'Posuere nisl.',
        103
    ),
    (
        'The most incredible article about cats you''ll ever read',
        'Lorem laborum.',
        100
    ),
    (
        '10 ways cats can help you live to 100',
        'Posuere nisl.',
        101
    ),
    (
        '9 reasons you can blame the recession on cats',
        'Lorem laborum.',
        102
    ),
    (
        '10 ways marketers are making you addicted to cats',
        'Posuere nisl.',
        103
    ),
    (
        '11 ways investing in cats can make you a millionaire',
        'Lorem  laborum.',
        100
    ),
    (
        'Why you should forget everything you learned about cats',
        'Posuere nisl.',
        101
    );

-- SELECT * 
-- FROM notes INNER JOIN folders ON notes.folder_id = folders.id;

-- SELECT *
-- FROM notes LEFT JOIN folders ON notes.folder_id = folders.id;

-- SELECT * 
-- FROM notes LEFT JOIN folders ON notes.folder_id = folders.id
-- WHERE notes.id = 1005;