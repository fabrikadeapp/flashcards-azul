import fs from 'fs';
import path from 'path';

const agentsDir = '.antigravity/rules/agents';
const workflowsDir = '_agents/workflows';

if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
}

if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    agents.forEach(agentFile => {
        const agentName = path.basename(agentFile, '.md');
        const content = fs.readFileSync(path.join(agentsDir, agentFile), 'utf-8');

        // Extract first line or description
        const titleMatch = content.match(/^# (.*)/);
        const title = titleMatch ? titleMatch[1] : agentName;

        const workflowContent = `---
description: Activate Agent: ${title}
---

To use the ${title} agent, please follow these steps:

1. Type \`@${agentName}\` or \`/${agentName}\` to load the persona.
2. Review the instructions in \`${path.join(agentsDir, agentFile)}\`.
3. Provide your task context.
`;

        fs.writeFileSync(path.join(workflowsDir, `${agentName}.md`), workflowContent);
        console.log(`Created workflow for ${agentName}`);
    });
} else {
    console.error('Agents directory not found');
}
