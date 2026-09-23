FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Precompile <bits/stdc++.h> next to the header so every submission (which
# includes it first, see cppRunner.js) loads the .gch instead of re-parsing
# the whole STL. The .gch is only used when compile flags match; cppRunner
# passes none, so none are passed here either.
RUN HDR=$(echo '#include <bits/stdc++.h>' | g++ -x c++ -E -H - 2>&1 >/dev/null \
      | grep -m1 'bits/stdc++\.h$' | sed 's/^\.* //') \
  && g++ -x c++-header "$HDR" -o "$HDR.gch"

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# SECURITY: drop root. The node:* images ship a non-root `node` user.
# chown so the app can still create/write its temp dir at runtime.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
