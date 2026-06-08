-- Sample documents for manual exploration in later phases.
-- Embeddings are not inserted here; indexing will populate document_chunks.

INSERT INTO documents (id, title, content, category, tags, content_hash)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'How do I reset my account password?',
    'To reset your account password, open the login page and choose Forgot Password. Follow the email link to create a new password.',
    'support',
    ARRAY['password', 'account', 'auth'],
    'seed-doc-1'
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Instructions for changing login credentials',
    'Users can change login credentials from account settings. Update your email or password and save the changes.',
    'support',
    ARRAY['login', 'credentials', 'auth'],
    'seed-doc-2'
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'The weather is sunny today',
    'Today is bright and sunny with clear skies. A great day for a walk outside.',
    'general',
    ARRAY['weather', 'outdoors'],
    'seed-doc-3'
  )
ON CONFLICT (id) DO NOTHING;
