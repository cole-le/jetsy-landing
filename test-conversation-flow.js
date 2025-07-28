import fetch from 'node-fetch';

async function testConversationFlow() {
  console.log('🧪 Testing Full Conversation Flow with Step-by-Step Clarification...\n');

  const projectId = `conversation-test-${Date.now()}`;
  let currentProjectId = null;

  // Step 1: Initial vague prompt
  console.log('📝 Step 1: Initial vague prompt');
  const initialResponse = await fetch('http://localhost:8787/api/llm-orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      user_message: "a space themed bar"
    })
  });

  const initialResult = await initialResponse.json();
  console.log(`✅ Response: ${initialResult.message}`);
  console.log(`   Question ${initialResult.current_question_index + 1} of ${initialResult.clarification_questions.length}`);
  console.log(`   Current question: ${initialResult.current_question.question}\n`);

  currentProjectId = projectId;

  // Step 2: Answer first question
  console.log('📝 Step 2: Answering first question');
  const answer1Response = await fetch('http://localhost:8787/api/llm-orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: currentProjectId,
      user_message: "Cosmic Cantina"
    })
  });

  const answer1Result = await answer1Response.json();
  console.log(`✅ Response: ${answer1Result.message}`);
  console.log(`   Question ${answer1Result.current_question_index + 1} of ${answer1Result.clarification_questions.length}`);
  console.log(`   Current question: ${answer1Result.current_question.question}\n`);

  // Step 3: Answer second question
  console.log('📝 Step 3: Answering second question');
  const answer2Response = await fetch('http://localhost:8787/api/llm-orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: currentProjectId,
      user_message: "futuristic space theme with neon lights and cosmic decor"
    })
  });

  const answer2Result = await answer2Response.json();
  console.log(`✅ Response: ${answer2Result.message}`);
  console.log(`   Question ${answer2Result.current_question_index + 1} of ${answer2Result.clarification_questions.length}`);
  console.log(`   Current question: ${answer2Result.current_question.question}\n`);

  // Step 4: Answer third question
  console.log('📝 Step 4: Answering third question');
  const answer3Response = await fetch('http://localhost:8787/api/llm-orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: currentProjectId,
      user_message: "craft cocktails and fusion cuisine with space-themed names"
    })
  });

  const answer3Result = await answer3Response.json();
  console.log(`✅ Response: ${answer3Result.message}`);
  console.log(`   Question ${answer3Result.current_question_index + 1} of ${answer3Result.clarification_questions.length}`);
  console.log(`   Current question: ${answer3Result.current_question.question}\n`);

  // Step 5: Answer final question
  console.log('📝 Step 5: Answering final question');
  const answer4Response = await fetch('http://localhost:8787/api/llm-orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: currentProjectId,
      user_message: "collect leads for reservations and showcase our unique atmosphere"
    })
  });

  const answer4Result = await answer4Response.json();
  console.log(`✅ Final Response:`);
  console.log(`   Needs clarification: ${answer4Result.needs_clarification}`);
  if (answer4Result.business_info) {
    console.log(`   Business: ${answer4Result.business_info.name}`);
    console.log(`   Type: ${answer4Result.business_info.color_scheme}`);
  }
  if (answer4Result.updated_files && Object.keys(answer4Result.updated_files).length > 0) {
    console.log(`   Website generated with ${Object.keys(answer4Result.updated_files).length} files`);
  }
  console.log(`   Message: ${answer4Result.message}\n`);

  console.log('🎉 Conversation flow test completed!');
}

// Run the test
testConversationFlow().catch(console.error); 