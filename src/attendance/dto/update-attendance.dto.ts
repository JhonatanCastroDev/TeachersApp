import { IsEnum } from "class-validator";
import { AttendanceStatus } from "./create-attendance.dto";


export class UpdateAttendanceDto {
    @IsEnum(AttendanceStatus)
    status: AttendanceStatus; 
}
