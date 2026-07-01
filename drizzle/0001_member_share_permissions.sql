ALTER TABLE list_members ADD COLUMN can_share INTEGER NOT NULL DEFAULT 0;

UPDATE list_members
SET can_share = 1
WHERE role = 'owner'
   OR EXISTS (
     SELECT 1
     FROM lists
     WHERE lists.id = list_members.list_id
       AND lists.owner_email = list_members.email
   );
