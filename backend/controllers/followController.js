const db = require('../database');

// Helper to resolve user name/details uniformly
async function getUserBasicDetails(userType, userId) {
  let query, params;
  if (userType === 'student') {
    query = `SELECT s.student_id as id, sla.username, COALESCE(spd.full_name, CONCAT(spd.first_name,' ',IFNULL(spd.last_name,''))) AS name, spd.profile_photo_url, 'student' as type
             FROM students s
             JOIN student_login_accounts sla ON sla.student_id = s.student_id
             JOIN student_personal_details spd ON spd.student_id = s.student_id
             WHERE s.student_id = ?`;
    params = [userId];
  } else if (userType === 'alumni') {
    query = `SELECT a.alumni_id as id, ala.username, COALESCE(spd.full_name, CONCAT(spd.first_name,' ',IFNULL(spd.last_name,''))) AS name, spd.profile_photo_url, 'alumni' as type
             FROM alumni a
             JOIN alumni_login_accounts ala ON ala.alumni_id = a.alumni_id
             JOIN student_personal_details spd ON spd.student_id = a.student_id
             WHERE a.alumni_id = ?`;
    params = [userId];
  } else {
    return null;
  }
  const [rows] = await db.execute(query, params);
  return rows[0] || null;
}

exports.followUser = async (req, res) => {
  try {
    const { follower_type, follower_id, following_type, following_id } = req.body;
    if (!follower_type || !follower_id || !following_type || !following_id) {
      return res.status(400).json({ success: false, message: 'All parameters required' });
    }
    
    // Check if already follows or requested
    const [existing] = await db.execute(
      'SELECT status FROM user_followers WHERE follower_type=? AND follower_id=? AND following_type=? AND following_id=?',
      [follower_type, follower_id, following_type, following_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Follow request already ${existing[0].status}` });
    }
    
    await db.execute(
      'INSERT INTO user_followers (follower_type, follower_id, following_type, following_id, status) VALUES (?, ?, ?, ?, ?)',
      [follower_type, follower_id, following_type, following_id, 'pending']
    );
    res.status(201).json({ success: true, message: 'Follow request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.acceptFollow = async (req, res) => {
  try {
    const { follower_type, follower_id, following_type, following_id } = req.body;
    await db.execute(
      'UPDATE user_followers SET status = ? WHERE follower_type=? AND follower_id=? AND following_type=? AND following_id=?',
      ['accepted', follower_type, follower_id, following_type, following_id]
    );
    res.json({ success: true, message: 'Follow request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectFollow = async (req, res) => {
  try {
    const { follower_type, follower_id, following_type, following_id } = req.body;
    await db.execute(
      'DELETE FROM user_followers WHERE follower_type=? AND follower_id=? AND following_type=? AND following_id=?',
      [follower_type, follower_id, following_type, following_id]
    );
    res.json({ success: true, message: 'Follow request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { follower_type, follower_id, following_type, following_id } = req.query;
    await db.execute(
      'DELETE FROM user_followers WHERE follower_type=? AND follower_id=? AND following_type=? AND following_id=?',
      [follower_type, follower_id, following_type, following_id]
    );
    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [rows] = await db.execute(
      'SELECT follower_type, follower_id FROM user_followers WHERE following_type=? AND following_id=? AND status=?',
      [userType, userId, 'accepted']
    );
    
    const enriched = await Promise.all(rows.map(r => getUserBasicDetails(r.follower_type, r.follower_id)));
    res.json({ success: true, followers: enriched.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [rows] = await db.execute(
      'SELECT following_type, following_id FROM user_followers WHERE follower_type=? AND follower_id=? AND status=?',
      [userType, userId, 'accepted']
    );
    
    const enriched = await Promise.all(rows.map(r => getUserBasicDetails(r.following_type, r.following_id)));
    res.json({ success: true, following: enriched.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [rows] = await db.execute(
      'SELECT follower_type, follower_id FROM user_followers WHERE following_type=? AND following_id=? AND status=?',
      [userType, userId, 'pending']
    );
    
    const enriched = await Promise.all(rows.map(r => getUserBasicDetails(r.follower_type, r.follower_id)));
    res.json({ success: true, requests: enriched.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Also add an endpoint to check current follow status
exports.getFollowStatus = async (req, res) => {
  try {
    const { follower_type, follower_id, following_type, following_id } = req.query;
    const [rows] = await db.execute(
      'SELECT status FROM user_followers WHERE follower_type=? AND follower_id=? AND following_type=? AND following_id=?',
      [follower_type, follower_id, following_type, following_id]
    );
    res.json({ success: true, status: rows.length > 0 ? rows[0].status : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const details = await getUserBasicDetails(userType, userId);
    if (!details) return res.status(404).json({ success: false, message: 'User not found' });
    
    const [[followerCountRow]] = await db.execute(
      'SELECT COUNT(*) as count FROM user_followers WHERE following_type=? AND following_id=? AND status=?',
      [userType, userId, 'accepted']
    );
    const [[followingCountRow]] = await db.execute(
      'SELECT COUNT(*) as count FROM user_followers WHERE follower_type=? AND follower_id=? AND status=?',
      [userType, userId, 'accepted']
    );
    
    // Add graduation year or batch year 
    if (userType === 'student') {
      const [[acad]] = await db.execute(
        'SELECT batch_year, expected_graduation_date FROM student_academic_details WHERE student_id=?', [userId]
      );
      details.batch_year = acad?.batch_year;
      details.expected_graduation_date = acad?.expected_graduation_date;
    } else if (userType === 'alumni') {
      const [[al]] = await db.execute(
        'SELECT graduation_year FROM alumni WHERE alumni_id=?', [userId]
      );
      details.batch_year = al?.graduation_year;
    }
    
    details.follower_count = followerCountRow.count;
    details.following_count = followingCountRow.count;
    
    res.json({ success: true, profile: details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, users: [] });
    
    const searchTerm = `%${q}%`;
    
    const [students] = await db.execute(`
      SELECT s.student_id as id, 'student' as type, sla.username, COALESCE(spd.full_name, CONCAT(spd.first_name,' ',IFNULL(spd.last_name,''))) AS name, spd.profile_photo_url
      FROM students s
      JOIN student_login_accounts sla ON sla.student_id = s.student_id
      JOIN student_personal_details spd ON spd.student_id = s.student_id
      JOIN student_contact_details scd ON scd.student_id = s.student_id
      WHERE sla.username LIKE ? OR spd.full_name LIKE ? OR spd.first_name LIKE ? OR s.roll_number LIKE ? OR scd.email LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    const [alumni] = await db.execute(`
      SELECT a.alumni_id as id, 'alumni' as type, ala.username, COALESCE(spd.full_name, CONCAT(spd.first_name,' ',IFNULL(spd.last_name,''))) AS name, spd.profile_photo_url
      FROM alumni a
      JOIN alumni_login_accounts ala ON ala.alumni_id = a.alumni_id
      JOIN student_personal_details spd ON spd.student_id = a.student_id
      JOIN student_contact_details scd ON scd.student_id = a.student_id
      WHERE ala.username LIKE ? OR spd.full_name LIKE ? OR spd.first_name LIKE ? OR scd.email LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    const results = [...students, ...alumni];
    res.json({ success: true, users: results.slice(0, 15) });
  } catch (err) {
    console.error('searchUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
