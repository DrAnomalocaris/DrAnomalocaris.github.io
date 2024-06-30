const user = 'DrAnomalocaris'; // Your GitHub username
const perPage = 5;
let page = 1;
let loading = false;
const token = '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'; // Replace with your GitHub personal access token

const container = document.getElementById('projects');
const loadingIndicator = document.getElementById('loading');

const fetchReadme = async (projectName, branch) => {
    try {
        const readmeResponse = await fetch(`https://raw.githubusercontent.com/${user}/${projectName}/${branch}/README.md`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        if (readmeResponse.ok) {
            let readmeText = await readmeResponse.text();
            readmeText = readmeText.split('\n').slice(0, 10).join('\n'); // Get first 10 lines
            return marked.parse(readmeText); // Parse Markdown to HTML
        } else {
            console.error(`Error fetching README for ${projectName} from ${branch} branch: ${readmeResponse.status} ${readmeResponse.statusText}`);
            return 'No README available';
        }
    } catch (readmeError) {
        console.error(`Error fetching README for ${projectName} from ${branch} branch: ${readmeError}`);
        return 'No README available';
    }
};

const loadProjects = async () => {
    if (loading) return;
    loading = true;
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch(`https://api.github.com/users/${user}/repos?per_page=${perPage}&page=${page}&sort=created&direction=desc`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching repositories: ${response.status} ${response.statusText}`);
        }
        
        const projects = await response.json();
        
        for (const project of projects) {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');

            const titleElement = document.createElement('a');
            titleElement.classList.add('project-title');
            titleElement.href = project.html_url;
            titleElement.target = '_blank';
            titleElement.textContent = project.name;

            const descriptionElement = document.createElement('div');
            descriptionElement.classList.add('project-description');

            let readmeHtml = await fetchReadme(project.name, 'master');
            if (readmeHtml === 'No README available') {
                readmeHtml = await fetchReadme(project.name, 'main');
            }
            descriptionElement.innerHTML = readmeHtml;

            projectElement.appendChild(titleElement);
            projectElement.appendChild(descriptionElement);

            container.appendChild(projectElement);
        }

        page++;
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        loading = false;
        loadingIndicator.style.display = 'none';
    }
};

const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
        loadProjects();
    }
};

window.addEventListener('scroll', handleScroll);
window.addEventListener('DOMContentLoaded', loadProjects);
