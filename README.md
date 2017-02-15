# gogs-clone
A command line utility to bulk clone organization repositories from a gogs server


Clones all repositories owned by a user the current working directory.
Repositories will be cloned into directories based on the full name of the repository, ie "./myuser/myrepo/"

Usage:
gogs-clone --token=<access-token> <url>
