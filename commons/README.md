This repo contains shared modules between [msgsafe/msgsafe-webapp](https://git.trustcorsystems.com/msgsafe/msgsafe-webapp) and [msgsafe/msgsafe-react-native-app](https://git.trustcorsystems.com/msgsafe/msgsafe-react-native-app).

Currently these modules are share –

- Redux (redux store and reducers)
- Sagas (redux-saga)
- Services (api client, logging, webrtc, etc)


# Cloning repo and sub-modules in one-shot
```bash
$ git clone --recursive [path]
```

# Cloning sub-module (after git pull of parent)
```bash
$ git submodule init
$ git submodule update
```

# Pulling submodule changes
```bash
$ git submodule update --remote
```

# Pushing submodule changes after committing

```bash
$ git push --recurse-submodules=on-demand
```

## Alternatively, `cd` into submodules dir and `git push`
