## Configuration

---

Configure the `data/orgData.json` file with your organization workspace, projects and tasks data (consult the [clockify API documentation](https://clockify.me/developers-api))

```json
{
  "workspaces": [
    { "name": "<your-custom-id>", "_id": "<workspace-id>" },
    { "name": "<your-custom-id>", "_id": "<workspace-id>" }
  ],
  "projects": [
    { "name": "<your-custom-id>", "_id": "<project-id>" },
    { "name": "<your-custom-id>", "_id": "<project-id>" }
  ],
  "tasks": [
    { "name": "<your-custom-id>", "_id": "<task-id>" },
    { "name": "<your-custom-id>", "_id": "<task-id>" }
  ]
}
```

## Usage

---

First, run `set-config` passing options `-w` (workspace), `-p` (project), `-t` (task) and `-k` (a personal API key, generated on clockify user's [profile settings](https://clockify.me/user/settings)).

```
npm run set-config -w <workspace> -p <project> -t <task> -k <api key>
```
