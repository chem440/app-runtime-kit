-- DropForeignKey
ALTER TABLE "sys_notification" DROP CONSTRAINT "sys_notification_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "sys_content_standard" DROP CONSTRAINT "sys_content_standard_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "sys_content_standard" DROP CONSTRAINT "sys_content_standard_session_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson" DROP CONSTRAINT "cap_lesson_project_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_message" DROP CONSTRAINT "cap_lesson_message_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_question" DROP CONSTRAINT "cap_lesson_question_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_confirmation" DROP CONSTRAINT "cap_lesson_confirmation_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_improvement" DROP CONSTRAINT "cap_lesson_improvement_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_improvement_note" DROP CONSTRAINT "cap_lesson_improvement_note_improvement_item_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_misconception" DROP CONSTRAINT "cap_lesson_misconception_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_udl" DROP CONSTRAINT "cap_lesson_udl_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_lesson_stage" DROP CONSTRAINT "flow_transition_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_session" DROP CONSTRAINT "cap_voice_session_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_session" DROP CONSTRAINT "cap_voice_session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_session" DROP CONSTRAINT "cap_voice_session_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_turn" DROP CONSTRAINT "cap_voice_turn_session_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_prompt" DROP CONSTRAINT "cap_voice_prompt_code_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_prompt" DROP CONSTRAINT "cap_voice_prompt_session_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_framework_code" DROP CONSTRAINT "cap_voice_framework_code_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_session_focus" DROP CONSTRAINT "cap_voice_session_focus_session_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_session_focus" DROP CONSTRAINT "cap_voice_session_focus_code_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_voice_prompt_setting" DROP CONSTRAINT "cap_voice_prompt_setting_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_mentor_invite" DROP CONSTRAINT "cap_mentor_invite_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_mentor_tag" DROP CONSTRAINT "cap_mentor_tag_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_mentor_comment" DROP CONSTRAINT "cap_mentor_comment_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_mentor_comment" DROP CONSTRAINT "cap_mentor_comment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "cap_mentor_comment" DROP CONSTRAINT "cap_mentor_comment_parent_id_fkey";

-- DropTable
DROP TABLE "cap_lesson";

-- DropTable
DROP TABLE "cap_lesson_project";

-- DropTable
DROP TABLE "cap_lesson_message";

-- DropTable
DROP TABLE "cap_lesson_question";

-- DropTable
DROP TABLE "cap_lesson_confirmation";

-- DropTable
DROP TABLE "cap_lesson_improvement";

-- DropTable
DROP TABLE "cap_lesson_improvement_note";

-- DropTable
DROP TABLE "cap_lesson_misconception";

-- DropTable
DROP TABLE "cap_lesson_udl";

-- DropTable
DROP TABLE "cap_lesson_stage";

-- DropTable
DROP TABLE "cap_lesson_file_chunk";

-- DropTable
DROP TABLE "cap_lesson_metrics";

-- DropTable
DROP TABLE "cap_voice_session";

-- DropTable
DROP TABLE "cap_voice_turn";

-- DropTable
DROP TABLE "cap_voice_prompt";

-- DropTable
DROP TABLE "cap_voice_framework";

-- DropTable
DROP TABLE "cap_voice_framework_code";

-- DropTable
DROP TABLE "cap_voice_session_focus";

-- DropTable
DROP TABLE "cap_voice_prompt_library";

-- DropTable
DROP TABLE "cap_voice_prompt_setting";

-- DropTable
DROP TABLE "cap_mentor_invite";

-- DropTable
DROP TABLE "cap_mentor_tag";

-- DropTable
DROP TABLE "cap_mentor_comment";

-- DropEnum
DROP TYPE "VoiceCoachStatus";

-- DropEnum
DROP TYPE "VoiceTurnSpeaker";

-- DropEnum
DROP TYPE "CoachPromptCategory";

-- DropEnum
DROP TYPE "InviteStatus";

-- DropEnum
DROP TYPE "TagArtifactType";

