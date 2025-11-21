import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  OPEN = 'OPEN',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  ESSAY = 'ESSAY',
}

export class MultipleChoiceOptionDto {
  @IsString()
  @IsNotEmpty()
  label: string; // A, B, C, D

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class QuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @Type(() => Number)
  lines?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MultipleChoiceOptionDto)
  options?: MultipleChoiceOptionDto[];
}

export class SeriesDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Ej: "I SERIE"

  @IsString()
  @IsNotEmpty()
  instructions: string; // Ej: "Responda de forma abierta."

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}


export class CreateExamDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeriesDto)
  series: SeriesDto[];

  @IsString()
  @IsNotEmpty()
  collaboratorName: string;

  @IsString()
  @IsOptional()
  documentCode?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  trainingName: string;

  @IsString()
  @IsOptional()
  internal: string;

  @IsString()
  @IsOptional()
  external: string;

  @IsString()
  @IsNotEmpty()
  passingScore: string;
}

