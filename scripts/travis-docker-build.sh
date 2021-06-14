#!/bin/bash

echo "TRAVIS_BRANCH=$TRAVIS_BRANCH"
echo "TRAVIS_BUILD_NUMBER=$TRAVIS_BUILD_NUMBER"
echo "TRAVIS_COMMIT=$TRAVIS_COMMIT"
echo "TRAVIS_TAG=$TRAVIS_TAG"

DOCKER_REPO=gladius/gladius
DOCKER_BUILD_TAG=travis-$TRAVIS_BUILD_NUMBER.${TRAVIS_COMMIT::8}
DOCKER_BRANCH_TAG=`if [ "$TRAVIS_BRANCH" == "master" ]; then echo -n "latest"; else echo -n "$TRAVIS_BRANCH"; fi`

echo "DOCKER_REPO=$DOCKER_REPO"
echo "DOCKER_BUILD_TAG=$DOCKER_BUILD_TAG"
echo "DOCKER_BRANCH_TAG=$DOCKER_BRANCH_TAG"
echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
docker build -f Dockerfile -t $DOCKER_REPO:$DOCKER_BRANCH_TAG .
#docker tag $DOCKER_REPO:$DOCKER_BUILD_TAG $DOCKER_REPO:$DOCKER_BRANCH_TAG
#if [ ! -z "$TRAVIS_TAG" ]; then
#    docker tag -f $DOCKER_REPO:$DOCKER_BUILD_TAG $DOCKER_REPO:$TRAVIS_TAG;
#fi
docker images
docker push $DOCKER_REPO
