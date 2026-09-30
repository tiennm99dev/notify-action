/**
 * @typedef {object} RunContext
 * @property {string} repo Repository in `owner/name` form.
 * @property {string} workflow Workflow name.
 * @property {string} runNumber Run number of the workflow.
 * @property {string} sha Short commit SHA.
 * @property {string} runUrl Link to the workflow run.
 */

/**
 * Read the workflow run details GitHub exposes as default environment variables.
 * @param {Record<string, string | undefined>} [env] Environment to read from.
 * @returns {RunContext} Run details used in the default message.
 */
export function readRunContext(env = process.env) {
  const server = env.GITHUB_SERVER_URL || 'https://github.com';
  const repo = env.GITHUB_REPOSITORY || '';
  return {
    repo,
    workflow: env.GITHUB_WORKFLOW || '',
    runNumber: env.GITHUB_RUN_NUMBER || '',
    sha: (env.GITHUB_SHA || '').slice(0, 7),
    runUrl: `${server}/${repo}/actions/runs/${env.GITHUB_RUN_ID || ''}`,
  };
}
