const db = require('./database');

async function testInsert() {
  try {
    const payload = {
      alumni_id: 1, // Assume alumni_id 1 exists from seeded data
      title: 'Software Engineer',
      description: 'Test Description',
      required_skills: 'React',
      stipend_salary: '1000',
      expectations: 'None',
      qualification: 'BTech',
      application_deadline: '2026-10-10T14:30' // Value from datetime-local
    };

    const [result] = await db.execute(
      `INSERT INTO jobs (alumni_id, title, description, required_skills, stipend_salary, expectations, qualification, application_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [payload.alumni_id, payload.title, payload.description, payload.required_skills, payload.stipend_salary, payload.expectations, payload.qualification, payload.application_deadline]
    );

    console.log('Success:', result);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testInsert();
