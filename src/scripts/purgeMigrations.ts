import { join } from "path";
import { readdirSync, rmdirSync, rmSync, statSync } from "fs";

function generatePath(...childPaths: string[]): string {
    const paths: string[] = [process.cwd(), "prisma", "migrations"];
    childPaths &&
        childPaths.forEach((path: string): number => paths.push(path));
    return join(...paths);
}

const migrationFolders: string[] = readdirSync(generatePath()).filter(
    (childPath: string): boolean =>
        statSync(generatePath(childPath)).isDirectory()
);

if (migrationFolders.length > 0) {
    try {
        migrationFolders.forEach((migrationPath: string): void => {
            readdirSync(generatePath(migrationPath)).forEach(
                (migrationFilePath: string): void =>
                    rmSync(generatePath(migrationPath, migrationFilePath), {
                        force: true
                    })
            );

            rmdirSync(generatePath(migrationPath));
        });

        console.log(
            `Successfully purged ${
                migrationFolders.length
            } Prisma migrations from ${generatePath()}`
        );
    } catch (error) {
        global.logger.error(error, "prisma");
    }
} else {
    console.log(`No migration folders found in ${generatePath()}`);
}
