import { stringToObjectId } from "../database/mongo";
import type { FSetUserPermission, SetUserPermission } from "./types";
import { getUserBasic } from "../users";
import { permissionLayer } from "modules/database";

/** Use this as both create and update. */
const setUserPermission: FSetUserPermission = async (
  input: SetUserPermission
) => {
  await getUserBasic(input.userId);

  const permObjId = await stringToObjectId(input.permissionId);

  if (!permObjId) {
    throw new Error("invalid permissionId");
  }

  const update = {
    $set: {
      "permissions.$[permission].active": input.active ?? true,
      "permissions.$[permission].updatedAt": new Date(),
    },

    $push: {
      permissions: {
        $each: [
          {
            id: permObjId,
            active: typeof input.active === "boolean" ? input.active : true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        $position: 0,
      },
    },
  };

  const options = { arrayFilters: [{ "permission.id": permObjId }] };

  const result = await permissionLayer.update(input.userId, update, options);

  if (result.matchedCount && !result.upsertedCount && !result.modifiedCount) {
    throw new Error("failed to create permission");
  }

  return true;
};

export default setUserPermission;
