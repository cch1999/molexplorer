class TagManager {
    constructor(repository) {
        this.repository = repository;
    }

    getTags(code) {
        return this.repository.getTags(code);
    }

    addTag(code, tag) {
        return this.repository.addTag(code, tag);
    }

    updateTag(code, oldTag, newTag) {
        return this.repository.updateTag(code, oldTag, newTag);
    }

    removeTag(code, tag) {
        return this.repository.removeTag(code, tag);
    }
}

export default TagManager;
