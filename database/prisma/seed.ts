import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/passwordService';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test users
  const testPassword = 'TestPass123!';
  const hashedPassword = await hashPassword(testPassword);
  console.log('✅ Generated password hash for test users');

  // Create Quiz Categories
  const agentCategory = await prisma.quizCategory.create({
    data: {
      name: 'Agent Fundamentals',
      description: 'Learn about AI agent design, architecture, and core concepts',
      icon: '🤖',
    },
  });

  const promptCategory = await prisma.quizCategory.create({
    data: {
      name: 'Prompt Engineering',
      description: 'Master the art of writing effective prompts and controlling AI outputs',
      icon: '✍️',
    },
  });

  const modelCategory = await prisma.quizCategory.create({
    data: {
      name: 'Model Selection & Context',
      description: 'Understand how to choose the right model and manage context effectively',
      icon: '🧠',
    },
  });

  console.log('✅ Created quiz categories');

  // Create Agent Fundamentals Quiz
  const agentQuiz = await prisma.quiz.create({
    data: {
      categoryId: agentCategory.id,
      title: 'Agent Design Basics',
      description: 'Test your understanding of AI agent fundamentals',
      difficulty: 'beginner',
      questions: {
        create: [
          {
            question: 'What is the primary purpose of an AI agent?',
            options: JSON.stringify([
              { id: 'a', text: 'To store data in databases' },
              { id: 'b', text: 'To autonomously perform tasks and make decisions' },
              { id: 'c', text: 'To compile code faster' },
              { id: 'd', text: 'To replace human developers entirely' },
            ]),
            correctAnswer: 'b',
            explanation:
              'AI agents are designed to autonomously perform tasks and make decisions based on their environment and goals. They perceive their environment, process information, and take actions to achieve specific objectives.',
            order: 1,
          },
          {
            question: 'Which component is NOT typically part of an AI agent architecture?',
            options: JSON.stringify([
              { id: 'a', text: 'Perception module' },
              { id: 'b', text: 'Decision-making logic' },
              { id: 'c', text: 'Graphics rendering engine' },
              { id: 'd', text: 'Action execution system' },
            ]),
            correctAnswer: 'c',
            explanation:
              'A graphics rendering engine is not a standard component of AI agent architecture. Core components typically include perception (sensing the environment), decision-making logic, and action execution systems.',
            order: 2,
          },
          {
            question: 'What is the "agent loop" in AI systems?',
            options: JSON.stringify([
              { id: 'a', text: 'A bug that causes infinite recursion' },
              { id: 'b', text: 'The cycle of perceiving, deciding, and acting' },
              { id: 'c', text: 'A training optimization technique' },
              { id: 'd', text: 'A type of neural network layer' },
            ]),
            correctAnswer: 'b',
            explanation:
              'The agent loop refers to the continuous cycle where an agent perceives its environment, makes decisions based on that information, executes actions, and then repeats the process. This is fundamental to how agents interact with their environment.',
            order: 3,
          },
          {
            question: 'In agent design, what does "autonomy" mean?',
            options: JSON.stringify([
              { id: 'a', text: 'The agent requires constant human supervision' },
              { id: 'b', text: 'The agent can operate and make decisions independently' },
              { id: 'c', text: 'The agent only works offline' },
              { id: 'd', text: 'The agent has emotional intelligence' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Autonomy in agent design means the agent can operate and make decisions independently without constant human intervention. Autonomous agents can adapt to changing conditions and pursue their goals with minimal external guidance.',
            order: 4,
          },
          {
            question: 'What is a "goal-oriented" agent?',
            options: JSON.stringify([
              { id: 'a', text: 'An agent that only responds to direct commands' },
              { id: 'b', text: 'An agent that works towards achieving specific objectives' },
              { id: 'c', text: 'An agent designed for sports analytics' },
              { id: 'd', text: 'An agent that prioritizes speed over accuracy' },
            ]),
            correctAnswer: 'b',
            explanation:
              'A goal-oriented agent is designed to work towards achieving specific objectives or goals. It plans and executes actions that move it closer to its defined goals, evaluating different paths and strategies to reach them.',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('✅ Created Agent Fundamentals quiz');

  // Create Prompt Engineering Quiz
  const promptQuiz = await prisma.quiz.create({
    data: {
      categoryId: promptCategory.id,
      title: 'Prompt Engineering Essentials',
      description: 'Master the fundamentals of writing effective prompts',
      difficulty: 'intermediate',
      questions: {
        create: [
          {
            question: 'What is "prompt engineering"?',
            options: JSON.stringify([
              { id: 'a', text: 'Writing code in a specialized programming language' },
              { id: 'b', text: 'The practice of crafting effective inputs to guide AI model outputs' },
              { id: 'c', text: 'Building hardware for AI systems' },
              { id: 'd', text: 'Training neural networks from scratch' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Prompt engineering is the practice of designing and refining inputs (prompts) to effectively guide AI models to produce desired outputs. It involves understanding how models interpret instructions and crafting prompts that elicit the best responses.',
            order: 1,
          },
          {
            question: 'Which technique involves providing examples in your prompt?',
            options: JSON.stringify([
              { id: 'a', text: 'Zero-shot prompting' },
              { id: 'b', text: 'Few-shot prompting' },
              { id: 'c', text: 'Chain-of-thought prompting' },
              { id: 'd', text: 'System prompting' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Few-shot prompting involves providing a few examples in your prompt to demonstrate the desired output format or behavior. This helps the model understand the task better and produce more accurate results.',
            order: 2,
          },
          {
            question: 'What is the purpose of "chain-of-thought" prompting?',
            options: JSON.stringify([
              { id: 'a', text: 'To make prompts longer' },
              { id: 'b', text: 'To encourage step-by-step reasoning in the model' },
              { id: 'c', text: 'To chain multiple API calls together' },
              { id: 'd', text: 'To reduce token usage' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Chain-of-thought prompting encourages the model to break down complex problems and show its reasoning process step-by-step. This often leads to more accurate results, especially for tasks requiring logical reasoning or multi-step problem solving.',
            order: 3,
          },
          {
            question: 'What is a "system prompt"?',
            options: JSON.stringify([
              { id: 'a', text: 'A prompt that only works on certain operating systems' },
              { id: 'b', text: 'Instructions that set the overall behavior and context for the AI' },
              { id: 'c', text: 'A prompt generated automatically by the system' },
              { id: 'd', text: 'A debugging message from the model' },
            ]),
            correctAnswer: 'b',
            explanation:
              'A system prompt provides overarching instructions that set the behavior, role, and context for the AI throughout the conversation. It helps establish consistent behavior and guides how the model should respond to user inputs.',
            order: 4,
          },
          {
            question: 'Why is specificity important in prompt engineering?',
            options: JSON.stringify([
              { id: 'a', text: 'To increase processing time' },
              { id: 'b', text: 'To reduce ambiguity and get more accurate, relevant outputs' },
              { id: 'c', text: 'To make prompts harder to understand' },
              { id: 'd', text: 'To limit the model\'s creativity' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Specificity in prompts reduces ambiguity and helps the model understand exactly what you want. Clear, specific instructions lead to more accurate and relevant outputs by eliminating guesswork and potential misinterpretations.',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('✅ Created Prompt Engineering quiz');

  // Create Model Selection Quiz
  const modelQuiz = await prisma.quiz.create({
    data: {
      categoryId: modelCategory.id,
      title: 'Model Selection & Context Management',
      description: 'Learn how to choose models and manage context effectively',
      difficulty: 'intermediate',
      questions: {
        create: [
          {
            question: 'What is "context window" in large language models?',
            options: JSON.stringify([
              { id: 'a', text: 'The size of the training dataset' },
              { id: 'b', text: 'The maximum amount of text the model can process at once' },
              { id: 'c', text: 'The time it takes to generate a response' },
              { id: 'd', text: 'The number of parameters in the model' },
            ]),
            correctAnswer: 'b',
            explanation:
              'The context window is the maximum amount of text (measured in tokens) that a model can process in a single request. This includes both the input prompt and the generated output. Understanding context windows is crucial for managing conversations and long documents.',
            order: 1,
          },
          {
            question: 'When should you choose a smaller, faster model over a larger one?',
            options: JSON.stringify([
              { id: 'a', text: 'For complex reasoning tasks requiring deep understanding' },
              { id: 'b', text: 'For simple, repetitive tasks where speed and cost matter' },
              { id: 'c', text: 'When working with code generation' },
              { id: 'd', text: 'Never, always use the largest model available' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Smaller, faster models are ideal for simple, repetitive tasks where speed and cost-efficiency are priorities. They work well for straightforward classification, simple Q&A, or basic text processing. Reserve larger models for tasks requiring complex reasoning or nuanced understanding.',
            order: 2,
          },
          {
            question: 'What happens when you exceed a model\'s context window?',
            options: JSON.stringify([
              { id: 'a', text: 'The model processes everything but slower' },
              { id: 'b', text: 'The model truncates or cannot process the input' },
              { id: 'c', text: 'The model automatically summarizes the content' },
              { id: 'd', text: 'The model charges extra fees' },
            ]),
            correctAnswer: 'b',
            explanation:
              'When you exceed the context window, the model either truncates the input (cutting off part of your text) or returns an error. This is why context management is important - you need to ensure your prompts and conversation history fit within the model\'s limits.',
            order: 3,
          },
          {
            question: 'What is "token" in the context of LLMs?',
            options: JSON.stringify([
              { id: 'a', text: 'A security credential for API access' },
              { id: 'b', text: 'A unit of text, roughly equivalent to a word or word piece' },
              { id: 'c', text: 'A type of neural network layer' },
              { id: 'd', text: 'A currency for paying API costs' },
            ]),
            correctAnswer: 'b',
            explanation:
              'A token is the basic unit of text that language models process. It\'s roughly equivalent to a word or a piece of a word. Models process text by breaking it into tokens, and both pricing and context limits are typically measured in tokens.',
            order: 4,
          },
          {
            question: 'What is a key consideration when managing conversation history?',
            options: JSON.stringify([
              { id: 'a', text: 'Always include every message from the start' },
              { id: 'b', text: 'Balance context retention with staying within token limits' },
              { id: 'c', text: 'Delete all history after each response' },
              { id: 'd', text: 'Only keep the last message' },
            ]),
            correctAnswer: 'b',
            explanation:
              'Effective conversation management requires balancing the need to retain important context with staying within the model\'s token limits. Strategies include summarizing old messages, keeping only relevant history, or using sliding windows to maintain recent context.',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('✅ Created Model Selection quiz');

  // Create a demo user with hashed password
  const demoUser = await prisma.user.create({
    data: {
      username: 'demo_user',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Created demo user');
  console.log(`   Username: demo_user`);
  console.log(`   Password: ${testPassword}`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`\nCreated:`);
  console.log(`  - 3 quiz categories`);
  console.log(`  - 3 quizzes`);
  console.log(`  - 15 questions`);
  console.log(`  - 1 demo user`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
