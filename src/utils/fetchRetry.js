function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchRetry(url, delay, tries, fetchOptions = {}) {
  function onError(err) {
    var triesLeft = tries - 1;
    if (!triesLeft) {
      throw err;
    }
    return wait(delay).then(() =>
      fetchRetry(url, delay, triesLeft, fetchOptions)
    );
  }

  const response = await fetch(url, fetchOptions);
  const { result = [] } = await response.json();
  if (!result || typeof result === "string") {
    return onError();
  }
  return result;
}

export async function RetryContractCall(method, delay = 500, tries = 5) {
  function onError(err) {
    var triesLeft = tries - 1;
    if (!triesLeft) {
      throw err;
    }

    return wait(delay).then(() => RetryContractCall(method, delay, triesLeft));
  }

  const response = await method.call().catch(onError);

  return response;
}

export default fetchRetry;
