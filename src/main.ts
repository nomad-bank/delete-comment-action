import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  console.log(
    `starting process for ${github.context.repo.owner}/${github.context.repo.repo}`
  )
  try {
    const token: string = core.getInput('github_token')
    const userName: string = core.getInput('delete_user_name')
    const issueNumber: string = core.getInput('issue_number')

    const octokit = github.getOctokit(token)

    const resp = await octokit.pulls.listReviewComments({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: Number(issueNumber)
    })

    const comments = resp.data.filter(it => it.user?.login === userName)

    for (const comment of comments) {
      console.log(
        `Processing issue ${comment.pull_request_url} user: ${comment.user} comment: ${comment.body_text}`
      )

      await octokit.request(
        'DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}',
        {
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          comment_id: comment.id
        }
      )
    }
  } catch (error) {
    console.error(error)
    console.error(error.stack)
    core.setFailed(error.message)
  }
}

run()
