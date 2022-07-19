import BpmnModdle from 'bpmn-moddle';
import Utils from './utils';
import { from, Observable, throwError as observableThrowError } from 'rxjs';
import { filter, map, mergeMap, toArray, distinct, catchError } from 'rxjs/operators';
import { FileUpload } from 'primeng/fileupload';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { formList } from '@app/workstation/baseForm/mapper';

export default class WorkFlowUtils {
    /**
     * Reads the uploaded file and returns a BpmnModdle instance   *
     *
     * @param file
     */
    static readUploadedFileAsBpmnModdle(file): Promise<any> {
        const temporaryFileReader = new FileReader();

        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new ErrorResult('MESSAGES.FILE_PARSER_ERROR', { parameter: file.name }));
            };

            temporaryFileReader.onload = () => {
                const bpmnfile = new BpmnModdle();
                bpmnfile.fromXML(temporaryFileReader.result, (err, definitions) => {
                    if (err) {
                        temporaryFileReader.abort();
                        reject(
                            observableThrowError(
                                new ErrorResult('MESSAGES.FILE_PARSER_ERROR', { parameter: file.name }),
                            ),
                        );
                    } else {
                        resolve(definitions);
                    }
                });
            };
            temporaryFileReader.readAsText(file);
        });
    }

    /**
     * For every bpmn file provided, will validate the existance of the form key on the system and return the invalid keys.
     *
     * @param files
     */
    static validateBpmnFiles(files: FileUpload[]): Observable<any> {
        const availableForkeys = Object.keys(formList);

        return from(files).pipe(
            filter((file) => this.getExtension(file.name) === 'bpmn'),
            map((file) => this.readUploadedFileAsBpmnModdle(file)),
            mergeMap((fileProm) => fileProm.then((file) => file)),
            mergeMap((bpmModdle) => bpmModdle && bpmModdle.get('rootElements')),
            filter((element: any) => element.$type === 'bpmn:Process'),
            map((process) => this.validateProcessName(process)),
            mergeMap((process) => process.flowElements),
            filter((flowElements) => flowElements['$type'] === 'bpmn:UserTask'),
            map((userTask) => userTask && userTask['$attrs'] && userTask['$attrs']['camunda:formKey']),
            mergeMap((fromKeys) => Utils.formsKeysStringToFormKeyArray(fromKeys)),
            distinct(),
            // TODO CHECK WHY A PUT FALSE
            filter((formkey) => !availableForkeys.includes(formkey)),
            toArray(),
            catchError((err) => err),
        );
    }

    static validateProcessName(process) {
        if (process.id.length > 250) {
            throw observableThrowError(new ErrorResult('MESSAGES.PROCESS_ID_LENGTH_ERROR'));
        } else if (!process.name) {
            throw observableThrowError(new ErrorResult('MESSAGES.PROCESS_NAME_ERROR'));
        }
        return process;
    }

    static hasValidExtension(file): boolean {
        return this.getValidExtensions().includes(this.getExtension(file));
    }

    static getExtension(filename: string): string {
        return filename && filename.split('.').pop();
    }

    static getValidExtensions(): string[] {
        return ['bpmn', 'cmmn', 'dmn'];
    }
}
