# watchdeps
Watch dependencies of your NodeJS projects.

## Usage

Install watchdeps globally:
```sh
sudo npm install -g watchdeps
```

Then, simply run the following command on any NodeJS project:
```sh
cd myproject/
watchdeps -u nfroidure
# prompt: password:  
# Done !
```

Get every available options by running:
```sh
watchdeps -h

#  Usage: watchdeps [options]
#
#  Options:
#
#    -h, --help              output usage information
#    -V, --version           output the version number
#    -U, --unwatch           unwatch repositories.
#    -v, --verbose           tell me everything!
#    -r, --recursive         recursively watch the dependencies dependencies.
#    -u, --username [value]  your GitHub username.
#    -p, --password [value]  your GitHub password (leave empty to be prompted, recommended).
```

## Contributing
Feel free to push your code if you agree with publishing under the MIT license.