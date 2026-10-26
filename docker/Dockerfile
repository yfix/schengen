ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm

ARG PLAYWRIGHT_VERSION
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

RUN npx -y "playwright@${PLAYWRIGHT_VERSION:?}" install --with-deps chromium \
 && rm -rf /root/.npm /var/lib/apt/lists/*

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
WORKDIR /app
ENTRYPOINT ["entrypoint"]
CMD ["bash"]
