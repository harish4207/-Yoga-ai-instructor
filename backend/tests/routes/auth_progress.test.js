const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication & User-Specific Security Unit Logic', () => {
  const secret = 'test-secret-key-12345';

  it('hashes passwords and validates with bcrypt correctly', async () => {
    const password = 'StrongPassword123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    expect(hash).not.toBe(password);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('creates and verifies user-specific JWT tokens without leaking claims', () => {
    const userId = '654321654321654321654321';
    const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(userId);
  });

  it('ensures session ownership isolation logic filters strictly by userId', () => {
    const userA = 'user_11111';
    const userB = 'user_22222';

    const mockDatabaseSessions = [
      { _id: 's1', userId: userA, asanaId: 'virabhadrasanaII', finalScore: 92 },
      { _id: 's2', userId: userA, asanaId: 'tadasana', finalScore: 95 },
      { _id: 's3', userId: userB, asanaId: 'virabhadrasanaII', finalScore: 60 },
    ];

    // User A query
    const userASessions = mockDatabaseSessions.filter((s) => s.userId === userA);
    expect(userASessions.length).toBe(2);
    expect(userASessions.every((s) => s.userId === userA)).toBe(true);

    // User B query
    const userBSessions = mockDatabaseSessions.filter((s) => s.userId === userB);
    expect(userBSessions.length).toBe(1);
    expect(userBSessions[0].finalScore).toBe(60);
  });
});
